import axios from 'axios';
import Document from '../models/Document.js';
import { queryRag } from './llmRag.service.js';

const FINANCIAL_ANALYST_SYSTEM_PROMPT = [
  'You are a careful financial analysis assistant.',
  'Use only the provided document context when citing uploaded documents.',
  'If context is thin, say what is missing and give a conservative next step.'
].join(' ');

const tokenize = (text) =>
  new Set(String(text || '').toLowerCase().match(/[a-z0-9]+/g) || []);

const createSnippet = (text, query) => {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }

  const queryTerms = [...tokenize(query)];
  const firstMatch = queryTerms
    .map((term) => normalized.toLowerCase().indexOf(term))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];
  const start = firstMatch === undefined ? 0 : Math.max(0, firstMatch - 120);

  return normalized.slice(start, start + 450);
};

export const estimateTokens = (text) => Math.ceil(String(text || '').split(/\s+/).filter(Boolean).length * 1.35);

export const retrieveRelevantDocuments = async ({ userId, query, limit = 5, documentIds = [] }) => {
  const queryTokens = tokenize(query);
  const filter = {
    userId,
    deletedAt: null,
    status: 'completed',
    extractedText: { $ne: '' }
  };

  if (documentIds.length) {
    filter._id = { $in: documentIds };
  }

  const documents = await Document.find(filter).sort({ updatedAt: -1 }).limit(100);

  return documents
    .map((document) => {
      const textTokens = tokenize(`${document.originalName} ${document.tags.join(' ')} ${document.extractedText}`);
      const overlap = [...queryTokens].filter((token) => textTokens.has(token)).length;
      const density = overlap / Math.max(1, queryTokens.size);

      return {
        document,
        score: Number((overlap + density).toFixed(4)),
        snippet: createSnippet(document.extractedText, query)
      };
    })
    .filter((result) => result.score > 0 || documents.length <= limit)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, Math.min(limit, 10)));
};

export const buildFallbackAnalysis = ({ query, sources }) => {
  if (!sources.length) {
    return [
      'I could not find matching uploaded document context for this query yet.',
      'Upload relevant filings, notes, or research documents, then ask again for source-grounded analysis.'
    ].join(' ');
  }

  const sourceSummary = sources
    .slice(0, 3)
    .map((source, index) => `${index + 1}. ${source.document.originalName}: ${source.snippet}`)
    .join('\n');

  return [
    `Based on the uploaded documents, here is the most relevant context for: "${query}".`,
    sourceSummary,
    'A local Ollama model is not required for retrieval, but configuring it will turn this context into a fuller narrative analysis.'
  ].join('\n\n');
};

const buildRetrievedChunksResponse = ({ query, sources }) => {
  if (!sources.length) {
    return buildFallbackAnalysis({ query, sources });
  }

  const sourceSummary = sources
    .slice(0, 5)
    .map((source, index) => [
      `${index + 1}. ${source.document.originalName}`,
      source.snippet
    ].join('\n'))
    .join('\n\n');

  return [
    `I could not generate a synthesized answer right now, but I did retrieve relevant document chunks for: "${query}".`,
    sourceSummary
  ].join('\n\n');
};

export const generateAnalysis = async ({ query, sources }) => {
  const context = sources.map((source) => `[${source.document.originalName}] ${source.snippet}`);
  const llmServiceUrl = process.env.LLM_SERVICE_URL;

  if (!llmServiceUrl) {
    return {
      response: buildFallbackAnalysis({ query, sources }),
      model: 'local-retrieval',
      provider: 'fallback',
      fallback: true
    };
  }

  try {
    const { data } = await axios.post(`${llmServiceUrl.replace(/\/$/, '')}/generate`, {
      prompt: query,
      system: FINANCIAL_ANALYST_SYSTEM_PROMPT,
      context,
      stream: false
    }, {
      timeout: 120000  // 2 minutes — Groq/Gemini generation can take time
    });

    return {
      response: data.response || buildFallbackAnalysis({ query, sources }),
      model: data.model || '',
      provider: data.provider || 'llm-service',
      fallback: Boolean(data.fallback)
    };
  } catch (error) {
    return {
      response: buildFallbackAnalysis({ query, sources }),
      model: 'local-retrieval',
      provider: 'fallback',
      fallback: true,
      error: error.message
    };
  }
};

export const runRagAnalysis = async ({ userId, query, limit = 5, documentIds = [], conversationId = null }) => {
  const filter = {
    userId,
    deletedAt: null,
    status: 'completed',
    ragDocumentId: { $ne: '' }
  };

  if (documentIds.length) {
    filter._id = { $in: documentIds };
  }

  const documents = await Document.find(filter).sort({ updatedAt: -1 }).limit(100);

  if (!documents.length) {
    return null;
  }

  const ragDocumentIds = [...new Set(documents.map((document) => document.ragDocumentId).filter(Boolean))];
  const documentByRagId = new Map(documents.map((document) => [document.ragDocumentId, document]));
  const ragResponse = await queryRag({
    question: query,
    topK: limit,
    documentIds: ragDocumentIds,
    conversationId: conversationId ? `u${userId}_${conversationId}` : `analysis-${userId}`,
    generateAnswer: String(process.env.RAG_GENERATE_ANSWER || 'true').toLowerCase() !== 'false'
  });

  if (!ragResponse) {
    return null;
  }

  const sources = (ragResponse.sources || [])
    .map((source) => {
      const document = documentByRagId.get(source.document_id);

      if (!document) {
        return null;
      }

      return {
        document,
        score: Number(source.score || 0),
        snippet: String(source.text || '').replace(/\s+/g, ' ').trim().slice(0, 1200),
        ragSource: source
      };
    })
    .filter(Boolean);

  return {
    response: ragResponse.generationUnavailable || ragResponse.provider === 'retrieval'
      ? buildRetrievedChunksResponse({ query, sources })
      : (ragResponse.answer || buildFallbackAnalysis({ query, sources })),
    sources,
    model: 'rag-pipeline',
    provider: ragResponse.provider || 'rag-pipeline',
    fallback: Boolean(ragResponse.generationUnavailable || ragResponse.provider === 'retrieval'),
    cached: Boolean(ragResponse.cached)
  };
};

export const serializeAnalysis = (analysis) => ({
  id: analysis._id,
  query: analysis.query,
  response: analysis.response,
  sources: analysis.sources,
  tokensUsed: analysis.tokensUsed,
  model: analysis.model,
  provider: analysis.provider,
  fallback: analysis.fallback,
  createdAt: analysis.createdAt,
  updatedAt: analysis.updatedAt
});
