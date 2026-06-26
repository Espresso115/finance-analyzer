import mongoose from 'mongoose';
import AnalysisHistory from '../models/AnalysisHistory.js';
import {
  estimateTokens,
  generateAnalysis,
  retrieveRelevantDocuments,
  runRagAnalysis,
  serializeAnalysis
} from '../services/analysis.service.js';

const getUserId = (req) => req.user._id;

const parseLimit = (value, fallback = 5) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.min(parsed, 10));
};

const parseDocumentIds = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((documentId) => String(documentId || '').trim())
    .filter((documentId) => mongoose.isValidObjectId(documentId))
    .slice(0, 50);
};

export const queryAnalysis = async (req, res) => {
  try {
    const query = String(req.body.query || '').trim();

    if (!query) {
      return res.status(400).json({ error: 'Analysis query is required' });
    }

    if (query.length > 1000) {
      return res.status(422).json({ error: 'Analysis query must be 1000 characters or fewer' });
    }

    const limit = parseLimit(req.body.limit);
    const documentIds = parseDocumentIds(req.body.documentIds);
    let sources;
    let generation;

    try {
      const ragGeneration = await runRagAnalysis({
        userId: getUserId(req),
        query,
        limit,
        documentIds,
        conversationId: req.body.conversationId ? String(req.body.conversationId) : null
      });

      if (ragGeneration) {
        sources = ragGeneration.sources;
        generation = ragGeneration;
      }
    } catch (ragError) {
      console.warn(`RAG Analysis Fallback: ${ragError.message}`);
    }

    if (!generation) {
      sources = await retrieveRelevantDocuments({
        userId: getUserId(req),
        query,
        limit,
        documentIds
      });
      generation = await generateAnalysis({ query, sources });
    }

    const sourcePayload = sources.map((source) => ({
      documentId: source.document._id,
      documentName: source.document.originalName,
      snippet: source.snippet,
      score: source.score
    }));

    const analysis = await AnalysisHistory.create({
      userId: getUserId(req),
      query,
      response: generation.response,
      sources: sourcePayload,
      tokensUsed: estimateTokens(`${query} ${generation.response}`),
      model: generation.model,
      provider: generation.provider,
      fallback: generation.fallback
    });

    return res.status(201).json({
      success: true,
      data: serializeAnalysis(analysis)
    });
  } catch (error) {
    console.error(`Analysis Query Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error running analysis' });
  }
};

export const listAnalysisHistory = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 20);
    const analyses = await AnalysisHistory.find({ userId: getUserId(req) })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      data: analyses.map((analysis) => serializeAnalysis(analysis))
    });
  } catch (error) {
    console.error(`List Analysis Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error retrieving analysis history' });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.analysisId)) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const analysis = await AnalysisHistory.findOne({
      _id: req.params.analysisId,
      userId: getUserId(req)
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    return res.json({
      success: true,
      data: serializeAnalysis(analysis)
    });
  } catch (error) {
    console.error(`Get Analysis Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error retrieving analysis' });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.analysisId)) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const analysis = await AnalysisHistory.findOneAndDelete({
      _id: req.params.analysisId,
      userId: getUserId(req)
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    return res.json({
      success: true,
      message: 'Analysis deleted'
    });
  } catch (error) {
    console.error(`Delete Analysis Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error deleting analysis' });
  }
};
