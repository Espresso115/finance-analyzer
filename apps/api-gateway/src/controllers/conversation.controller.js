import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';

const getUserId = (req) => req.user._id;

const serializeConversation = (conv) => ({
  id: conv._id.toString(),
  title: conv.title,
  documentIds: conv.documentIds || [],
  messages: conv.messages || [],
  lastMessage: conv.lastMessage || '',
  messageCount: conv.messageCount || 0,
  createdAt: conv.createdAt,
  updatedAt: conv.updatedAt
});

export const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: getUserId(req) })
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      data: conversations.map(serializeConversation)
    });
  } catch (error) {
    console.error(`List Conversations Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error retrieving conversations' });
  }
};

export const getConversation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      userId: getUserId(req)
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.json({
      success: true,
      data: serializeConversation(conversation)
    });
  } catch (error) {
    console.error(`Get Conversation Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error retrieving conversation' });
  }
};

export const createConversation = async (req, res) => {
  try {
    const title = String(req.body.title || 'New Conversation').trim();
    const documentIds = Array.isArray(req.body.documentIds) ? req.body.documentIds : [];

    const conversation = await Conversation.create({
      userId: getUserId(req),
      title,
      documentIds,
      messages: [],
      messageCount: 0
    });

    return res.status(201).json({
      success: true,
      data: serializeConversation(conversation)
    });
  } catch (error) {
    console.error(`Create Conversation Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error creating conversation' });
  }
};

export const updateConversation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const title = String(req.body.title || '').trim();
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.conversationId, userId: getUserId(req) },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.json({
      success: true,
      data: serializeConversation(conversation)
    });
  } catch (error) {
    console.error(`Update Conversation Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error updating conversation' });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.conversationId,
      userId: getUserId(req)
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    console.error(`Delete Conversation Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error deleting conversation' });
  }
};

export const addMessage = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { message } = req.body;
    if (!message || !message.content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      userId: getUserId(req)
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    conversation.messages.push({
      id: message.id || `msg-${Date.now()}`,
      role: message.role,
      content: message.content,
      sources: message.sources || [],
      timestamp: message.timestamp || new Date().toISOString()
    });

    conversation.messageCount = conversation.messages.length;
    conversation.lastMessage = message.content.substring(0, 50);

    await conversation.save();

    return res.json({
      success: true,
      data: serializeConversation(conversation)
    });
  } catch (error) {
    console.error(`Add Message Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error adding message' });
  }
};
