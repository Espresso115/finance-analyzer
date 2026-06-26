import math
from collections import Counter, defaultdict

from app.config.settings import settings
from app.utils.text_utils import normalize_text, tokenize_search


RISK_TERMS = [
    "competition",
    "competitive",
    "supply",
    "supplier",
    "demand",
    "customer",
    "regulatory",
    "regulation",
    "export",
    "liquidity",
    "market",
    "macroeconomic",
    "geopolitical",
    "cybersecurity",
    "inventory",
    "manufacturing",
    "depend",
    "adverse",
]


class HybridRetrievalService:
    def expand_query(self, query: str) -> str:
        lowered = query.lower()
        if "risk" not in lowered:
            return query

        return f"{query} Item 1A Risk Factors {' '.join(RISK_TERMS)}"

    def bm25_search(
        self,
        query: str,
        chunks: list[dict],
        top_k: int,
    ) -> list[dict]:
        if not chunks:
            return []

        query_tokens = tokenize_search(self.expand_query(query))
        documents = [
            tokenize_search(self._searchable_text(chunk))
            for chunk in chunks
        ]
        doc_count = len(documents)
        avgdl = sum(len(doc) for doc in documents) / max(doc_count, 1)
        doc_freq = Counter()

        for doc in documents:
            doc_freq.update(set(doc))

        scores = []
        for chunk, doc in zip(chunks, documents):
            score = self._bm25_score(query_tokens, doc, doc_freq, doc_count, avgdl)
            score += self._section_boost(query, chunk)
            if score > 0:
                scores.append({"score": score, "chunk": chunk})

        return sorted(scores, key=lambda item: item["score"], reverse=True)[:top_k]

    def reciprocal_rank_fusion(
        self,
        result_lists: list[list[dict]],
        top_k: int,
    ) -> list[dict]:
        scores = defaultdict(float)
        chunks_by_id = {}

        for results in result_lists:
            for rank, result in enumerate(results, start=1):
                chunk = result["chunk"]
                chunk_id = chunk["chunk_id"]
                chunks_by_id[chunk_id] = chunk
                scores[chunk_id] += 1 / (settings.rrf_k + rank)

        fused = [
            {
                "score": score,
                "chunk": chunks_by_id[chunk_id],
            }
            for chunk_id, score in scores.items()
        ]

        return sorted(fused, key=lambda item: item["score"], reverse=True)[:top_k]

    def dedupe_results(self, results: list[dict], top_k: int) -> list[dict]:
        seen_hashes = set()
        seen_text = set()
        deduped = []

        for result in results:
            chunk = result["chunk"]
            metadata = chunk.get("metadata", {})
            content_hash = metadata.get("content_hash")
            normalized = normalize_text(chunk.get("text", "")).lower()
            text_key = normalized[: settings.dedup_text_prefix_chars]
            key = content_hash or text_key

            if key in seen_hashes or text_key in seen_text:
                continue

            seen_hashes.add(key)
            seen_text.add(text_key)
            deduped.append(result)

            if len(deduped) >= top_k:
                break

        return deduped

    def rerank_financial_results(self, query: str, results: list[dict]) -> list[dict]:
        return sorted(
            results,
            key=lambda result: self._quality_score(query, result),
            reverse=True,
        )

    def _searchable_text(self, chunk: dict) -> str:
        metadata = chunk.get("metadata", {})
        return "\n".join(
            [
                str(metadata.get("filename", "")),
                str(metadata.get("heading_path") or metadata.get("heading", "")),
                str(metadata.get("section_code", "")),
                chunk.get("text", ""),
            ]
        )

    def _bm25_score(
        self,
        query_tokens: list[str],
        doc_tokens: list[str],
        doc_freq: Counter,
        doc_count: int,
        avgdl: float,
    ) -> float:
        if not doc_tokens:
            return 0.0

        term_freq = Counter(doc_tokens)
        score = 0.0
        k1 = 1.5
        b = 0.75
        dl = len(doc_tokens)

        for token in query_tokens:
            if token not in term_freq:
                continue

            idf = math.log(1 + (doc_count - doc_freq[token] + 0.5) / (doc_freq[token] + 0.5))
            numerator = term_freq[token] * (k1 + 1)
            denominator = term_freq[token] + k1 * (1 - b + b * dl / max(avgdl, 1))
            score += idf * numerator / denominator

        return score

    def _section_boost(self, query: str, chunk: dict) -> float:
        metadata = chunk.get("metadata", {})
        section_code = metadata.get("section_code")
        text = query.lower()

        if "risk" in text and section_code == "item_1a":
            return settings.section_boost_score

        if "management" in text and section_code == "item_7":
            return settings.section_boost_score

        if "financial statement" in text and section_code == "item_8":
            return settings.section_boost_score

        return 0.0

    def _quality_score(self, query: str, result: dict) -> float:
        chunk = result["chunk"]
        metadata = chunk.get("metadata", {})
        text = chunk.get("text", "")
        heading = str(metadata.get("heading", ""))
        section_code = metadata.get("section_code")
        score = result["score"]
        lowered_query = query.lower()
        lowered_text = text.lower()
        lowered_heading = heading.lower()

        if "risk" in lowered_query:
            if section_code == "item_1a":
                score += 0.08

            risk_term_hits = sum(1 for term in RISK_TERMS if term in lowered_text)
            score += min(risk_term_hits, 6) * 0.01

            compact_heading = " ".join(lowered_heading.split())
            if compact_heading in {"item 1a. risk factors", "item 1a risk factors"}:
                score -= 0.12

            if "following risk factors should be considered" in lowered_text:
                score -= 0.08

            if "including those described below" in lowered_text:
                score -= 0.06

            if "past financial performance should not be considered" in lowered_text:
                score -= 0.06

            if "refer to 'item 1a" in lowered_text or 'refer to "item 1a' in lowered_text:
                score -= 0.05

        return score
