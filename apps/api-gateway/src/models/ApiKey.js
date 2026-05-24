import mongoose from 'mongoose';

const ApiKeySchema = new mongoose.Schema({
  keyHash: {
    type: String,
    required: true,
    unique: true
  },
  keyPrefix: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  revokedAt: {
    type: Date,
    default: null
  },
  lastUsedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const ApiKey = mongoose.model('ApiKey', ApiKeySchema);

export default ApiKey;
