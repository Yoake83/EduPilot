import { requireAI, requireQueue } from '../middleware/service-ready';
import { safeRouter } from '../middleware/safe-router';
import multer from 'multer';
import { createQuiz, getQuizzes, getQuiz, deleteQuiz } from '../controllers/quiz.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = safeRouter();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', requireAuth, getQuizzes);
router.get('/:id', requireAuth, getQuiz);
router.post('/', requireAuth, requireQueue, requireAI, upload.single('file'), createQuiz);
router.delete('/:id', requireAuth, deleteQuiz);

export default router;