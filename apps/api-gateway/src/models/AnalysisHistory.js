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
    type: String 
  }],
  tokensUsed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const AnalysisHistory = mongoose.model('AnalysisHistory', AnalysisHistorySchema);

export default AnalysisHistory;
