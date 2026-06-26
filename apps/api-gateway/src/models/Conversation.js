import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: { type: String },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  sources: { type: Array, default: [] },
  timestamp: { type: String }
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  documentIds: [{
    type: String
  }],
  messages: [MessageSchema],
  lastMessage: {
    type: String,
    default: ''
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;
