import { Router } from 'express';
import multer from 'multer';
import { uploadMaterial, getMaterials, deleteMaterial, askQuestion } from '../controllers/study.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/', requireAuth, getMaterials);
router.post('/upload', requireAuth, upload.single('file'), uploadMaterial);
router.delete('/:id', requireAuth, deleteMaterial);
router.post('/ask', requireAuth, askQuestion);

export default router;