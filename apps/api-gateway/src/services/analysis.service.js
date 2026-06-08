import axios from 'axios';
import Document from '../models/Document.js';

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

export const retrieveRelevantDocuments = async ({ userId, query, limit = 5 }) => {
  const queryTokens = tokenize(query);
  const documents = await Document.find({
    userId,
    deletedAt: null,
    status: 'completed',
    extractedText: { $ne: '' }
  }).sort({ updatedAt: -1 }).limit(100);

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
      timeout: 10000
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
