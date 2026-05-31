import { Router } from 'express';
import {
  exportMarketData,
  getMarketHistory,
  getMarketQuote,
  getMarketSummary,
  searchMarket
} from '../controllers/market.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Protect market endpoints as they are premium features
router.get('/search', protect, searchMarket);
router.get('/summary', protect, getMarketSummary);
router.get('/export', protect, exportMarketData);
router.get('/history/:symbol', protect, getMarketHistory);
router.get('/quote/:symbol', protect, getMarketQuote);

export default router;
