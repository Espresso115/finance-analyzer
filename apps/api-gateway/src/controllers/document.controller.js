import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Document from '../models/Document.js';
import {
  extractLocalDocumentText,
  normalizeDocumentTags,
  serializeDocument
} from '../services/document.service.js';
import { ingestDocumentWithRag, isRagIntegrationEnabled } from '../services/llmRag.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const documentUploadRoot = path.resolve(__dirname, '..', '..', 'uploads', 'documents');

export const ensureDocumentUploadDirectory = async (root = documentUploadRoot) => {
  await fs.mkdir(root, { recursive: true });
};

const getUserId = (req) => req.user._id;
const RAG_INGESTIBLE_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const parseLimit = (value, fallback = 20) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), 100);
};

const parseOffset = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.max(parsed, 0);
};

export const uploadDocuments = async (req, res) => {
  try {
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ error: 'At least one document file is required' });
    }

    const tags = normalizeDocumentTags(req.body.tags);
    const description = String(req.body.description || '').trim().slice(0, 500);
    const documents = [];

    for (const file of files) {
      const parseResult = await extractLocalDocumentText(file);
      const document = await Document.create({
        userId: getUserId(req),
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        description,
        tags,
        ...parseResult
      });

      if (isRagIntegrationEnabled() && RAG_INGESTIBLE_MIME_TYPES.has(file.mimetype)) {
        document.status = 'processing';
        await document.save();

        try {
          const ragResult = await ingestDocumentWithRag(file);

          if (ragResult) {
            document.ragDocumentId = ragResult.documentId || '';
            document.status = ragResult.status === 'indexed' ? 'completed' : 'processing';
            document.chunkCount = ragResult.indexedChunkCount || ragResult.chunkCount || document.chunkCount;
            document.parseMetadata = {
              parser: 'rag-pipeline',
              contentType: file.mimetype,
              wordCount: document.parseMetadata?.wordCount || 0
            };
            document.errorMessage = '';
            document.processedAt = new Date();
            await document.save();
          }
        } catch (ragError) {
          document.status = 'error';
          document.errorMessage = ragError.message;
          await document.save();
          console.error(`RAG Ingestion Error (${file.originalname}): ${ragError.message}`);
        }
      }

      documents.push(serializeDocument(document, { includeText: false }));
    }

    return res.status(201).json({
      success: true,
      message: 'Document upload completed',
      data: documents
    });
  } catch (error) {
    console.error(`Upload Documents Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error uploading documents' });
  }
};

export const listDocuments = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const offset = parseOffset(req.query.offset);
    const status = String(req.query.status || '').trim();
    const filter = {
      userId: getUserId(req),
      deletedAt: null
    };

    if (status) {
      if (!['pending', 'processing', 'completed', 'error'].includes(status)) {
        return res.status(422).json({ error: 'Status must be pending, processing, completed, or error' });
      }

      filter.status = status;
    }

    const [documents, total] = await Promise.all([
      Document.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit),
      Document.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: documents.map((document) => serializeDocument(document)),
      pagination: {
        limit,
        offset,
        total
      }
    });
  } catch (error) {
    console.error(`List Documents Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error retrieving documents' });
  }
};

export const getDocument = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.documentId)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = await Document.findOne({
      _id: req.params.documentId,
      userId: getUserId(req),
      deletedAt: null
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.json({
      success: true,
      data: serializeDocument(document, { includeText: true })
    });
  } catch (error) {
    console.error(`Get Document Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error retrieving document' });
  }
};

export const updateDocument = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.documentId)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = await Document.findOne({
      _id: req.params.documentId,
      userId: getUserId(req),
      deletedAt: null
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (req.body.description !== undefined) {
      document.description = String(req.body.description).trim().slice(0, 500);
    }

    if (req.body.tags !== undefined) {
      document.tags = normalizeDocumentTags(req.body.tags);
    }

    await document.save();

    return res.json({
      success: true,
      message: 'Document metadata updated',
      data: serializeDocument(document)
    });
  } catch (error) {
    console.error(`Update Document Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error updating document' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.documentId)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = await Document.findOne({
      _id: req.params.documentId,
      userId: getUserId(req),
      deletedAt: null
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.deletedAt = new Date();
    await document.save();

    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      if (fileError.code !== 'ENOENT') {
        console.warn(`Could not remove uploaded document file: ${fileError.message}`);
      }
    }

    return res.json({
      success: true,
      message: 'Document deleted'
    });
  } catch (error) {
    console.error(`Delete Document Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error deleting document' });
  }
};

export const searchDocuments = async (req, res) => {
  try {
    const query = String(req.body.query || req.query.q || '').trim();
    const limit = parseLimit(req.body.limit || req.query.limit, 10);

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (query.length > 200) {
      return res.status(422).json({ error: 'Search query must be 200 characters or fewer' });
    }

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const documents = await Document.find({
      userId: getUserId(req),
      deletedAt: null,
      $or: [
        { originalName: regex },
        { tags: regex },
        { extractedText: regex },
        { textPreview: regex }
      ]
    }).sort({ updatedAt: -1 }).limit(limit);

    return res.json({
      success: true,
      data: documents.map((document) => serializeDocument(document)),
      query
    });
  } catch (error) {
    console.error(`Search Documents Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error searching documents' });
  }
};
