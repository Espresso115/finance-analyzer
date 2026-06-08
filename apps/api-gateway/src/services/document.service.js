import fs from 'fs/promises';
import path from 'path';

export const SUPPORTED_DOCUMENT_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv']
};

export const MAX_DOCUMENT_SIZE_BYTES = 100 * 1024 * 1024;

const TEXT_MIME_TYPES = new Set(['text/plain', 'text/markdown', 'text/csv']);

export const normalizeDocumentTags = (tags) => {
  if (!tags) {
    return [];
  }

  const values = Array.isArray(tags) ? tags : String(tags).split(',');

  return [...new Set(values
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12))]
    .map((tag) => tag.slice(0, 32));
};

export const isSupportedDocumentFile = (file) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const allowedExtensions = SUPPORTED_DOCUMENT_TYPES[file.mimetype];

  return Boolean(allowedExtensions?.includes(extension));
};

export const createTextPreview = (text) =>
  text.replace(/\s+/g, ' ').trim().slice(0, 500);

export const estimateChunkCount = (text, chunkSize = 900) => {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }

  return Math.max(1, Math.ceil(normalized.length / chunkSize));
};

export const extractLocalDocumentText = async (file) => {
  if (!TEXT_MIME_TYPES.has(file.mimetype)) {
    return {
      status: 'pending',
      extractedText: '',
      textPreview: '',
      chunkCount: 0,
      parseMetadata: {
        parser: 'external-service-required',
        contentType: file.mimetype,
        wordCount: 0
      },
      errorMessage: ''
    };
  }

  const buffer = await fs.readFile(file.path);
  const extractedText = buffer.toString('utf8').replace(/\u0000/g, '').trim();
  const wordCount = extractedText ? extractedText.split(/\s+/).length : 0;

  return {
    status: 'completed',
    extractedText,
    textPreview: createTextPreview(extractedText),
    chunkCount: estimateChunkCount(extractedText),
    parseMetadata: {
      parser: 'api-gateway-text-fallback',
      contentType: file.mimetype,
      wordCount
    },
    errorMessage: '',
    processedAt: new Date()
  };
};

export const serializeDocument = (document, { includeText = false } = {}) => {
  const serialized = {
    id: document._id,
    filename: document.filename,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: document.size,
    status: document.status,
    description: document.description,
    tags: document.tags,
    textPreview: document.textPreview,
    chunkCount: document.chunkCount,
    parseMetadata: document.parseMetadata,
    errorMessage: document.errorMessage,
    processedAt: document.processedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  };

  if (includeText) {
    serialized.extractedText = document.extractedText;
  }

  return serialized;
};
