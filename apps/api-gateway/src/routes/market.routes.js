import { Router } from 'express';
import { getMarketQuote } from '../controllers/market.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Protect market endpoints as they are premium features
router.get('/quote/:symbol', protect, getMarketQuote);

export default router;
