import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Get current user's profile
router.get('/profile', protect, getProfile);

// Update current user's profile
router.put('/profile', protect, updateProfile);

export default router;
