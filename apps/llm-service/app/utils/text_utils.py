import hashlib
import re


WHITESPACE_RE = re.compile(r"\s+")
TOKEN_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9\-']*")
SEC_ITEM_RE = re.compile(
    r"\bItem\s+(1A|1B|1C|2|3|4|5|6|7|7A|8|9|9A|9B|10|11|12|13|14|15)\b",
    re.IGNORECASE,
)


def normalize_text(text: str) -> str:
    return WHITESPACE_RE.sub(" ", text or "").strip()


def tokenize_search(text: str) -> list[str]:
    return [
        token.lower()
        for token in TOKEN_RE.findall(normalize_text(text))
    ]


def content_hash(text: str) -> str:
    normalized = normalize_text(text).lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def detect_sec_section_code(heading: str) -> str | None:
    match = SEC_ITEM_RE.search(heading or "")
    if not match:
        return None

    return f"item_{match.group(1).lower()}"
