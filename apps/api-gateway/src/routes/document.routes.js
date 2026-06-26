import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import {
  deleteDocument,
  documentUploadRoot,
  getDocument,
  listDocuments,
  searchDocuments,
  updateDocument,
  uploadDocuments
} from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  isSupportedDocumentFile,
  MAX_DOCUMENT_SIZE_BYTES
} from '../services/document.service.js';

const router = Router();

const documentStorage = multer.diskStorage({
  destination: documentUploadRoot,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, extension)
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'document';

    cb(null, `${req.user._id}-${Date.now()}-${safeBaseName}${extension}`);
  }
});

const upload = multer({
  storage: documentStorage,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE_BYTES,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    if (!isSupportedDocumentFile(file)) {
      const error = new Error('Only PDF documents are supported');
      error.statusCode = 422;
      error.code = 'UNSUPPORTED_DOCUMENT_TYPE';
      cb(error);
      return;
    }

    cb(null, true);
  }
});

router.use(protect);

router.get('/', listDocuments);
router.post('/search', searchDocuments);
router.post('/upload', upload.array('documents', 5), uploadDocuments);
router.get('/:documentId', getDocument);
router.put('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);

export default router;
