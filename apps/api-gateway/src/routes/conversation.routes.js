import { Router } from 'express';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  addMessage
} from '../controllers/conversation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:conversationId', getConversation);
router.put('/:conversationId', updateConversation);
router.delete('/:conversationId', deleteConversation);
router.post('/:conversationId/messages', addMessage);

export default router;
