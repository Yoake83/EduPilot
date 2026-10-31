import { requireAI } from '../middleware/service-ready';
import { safeRouter } from '../middleware/safe-router';
import multer from 'multer';
import { uploadMaterial, getMaterials, deleteMaterial, askQuestion } from '../controllers/study.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = safeRouter();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/', requireAuth, getMaterials);
router.post('/upload', requireAuth, upload.single('file'), uploadMaterial);
router.delete('/:id', requireAuth, deleteMaterial);
router.post('/ask', requireAuth, requireAI, askQuestion);

export default router;