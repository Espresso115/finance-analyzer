import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  extractedText: {
    type: String,
    default: ''
  },
  textPreview: {
    type: String,
    default: ''
  },
  chunkCount: {
    type: Number,
    default: 0
  },
  parseMetadata: {
    parser: { type: String, default: 'pending' },
    contentType: { type: String, default: '' },
    wordCount: { type: Number, default: 0 }
  },
  errorMessage: {
    type: String,
    default: ''
  },
  ragDocumentId: {
    type: String,
    default: '',
    index: true
  },
  processedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

DocumentSchema.index({ userId: 1, createdAt: -1 });
DocumentSchema.index({ userId: 1, status: 1 });
DocumentSchema.index({ originalName: 'text', extractedText: 'text', tags: 'text' });

const Document = mongoose.model('Document', DocumentSchema);

export default Document;
