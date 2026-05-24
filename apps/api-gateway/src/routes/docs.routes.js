import { Router } from 'express';
import { getDocsPage, getOpenApiSpec } from '../controllers/docs.controller.js';

const router = Router();

router.get('/', getDocsPage);
router.get('/openapi.json', getOpenApiSpec);

export default router;
