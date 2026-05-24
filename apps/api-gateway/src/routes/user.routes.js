import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import {
  changePassword,
  createApiKey,
  deleteAccount,
  getCurrentUser,
  getProfile,
  getSettings,
  getUserById,
  listApiKeys,
  revokeApiKey,
  updateProfile,
  updateSettings,
  uploadAvatar
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

const avatarStorage = multer.diskStorage({
  destination: 'uploads/avatars',
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user._id}-${Date.now()}${extension}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
      cb(new Error('Only PNG, JPEG, and WEBP images are supported'));
      return;
    }

    cb(null, true);
  }
});

router.use(protect);

router.get('/me', getCurrentUser);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/change-password', changePassword);
router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.delete('/me', deleteAccount);

router.get('/api-keys', listApiKeys);
router.post('/api-keys', createApiKey);
router.delete('/api-keys/:keyId', revokeApiKey);

router.get('/:userId', getUserById);

export default router;
