import { Router } from 'express';
import {
  deleteAnalysis,
  getAnalysis,
  listAnalysisHistory,
  queryAnalysis
} from '../controllers/analysis.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/query', queryAnalysis);
router.get('/history', listAnalysisHistory);
router.get('/:analysisId', getAnalysis);
router.delete('/:analysisId', deleteAnalysis);

export default router;
