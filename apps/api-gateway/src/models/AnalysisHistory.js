import mongoose from 'mongoose';

const AnalysisHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    default: ''
  },
  sources: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    documentName: {
      type: String,
      default: ''
    },
    snippet: {
      type: String,
      default: ''
    },
    score: {
      type: Number,
      default: 0
    }
  }],
  tokensUsed: {
    type: Number,
    default: 0
  },
  model: {
    type: String,
    default: ''
  },
  provider: {
    type: String,
    default: 'fallback'
  },
  fallback: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

AnalysisHistorySchema.index({ userId: 1, createdAt: -1 });

const AnalysisHistory = mongoose.model('AnalysisHistory', AnalysisHistorySchema);

export default AnalysisHistory;
