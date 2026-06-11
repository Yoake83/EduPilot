import { Router } from 'express';
import multer from 'multer';
import { createQuiz, getQuizzes, getQuiz, deleteQuiz } from '../controllers/quiz.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', requireAuth, getQuizzes);
router.get('/:id', requireAuth, getQuiz);
router.post('/', requireAuth, upload.single('file'), createQuiz);
router.delete('/:id', requireAuth, deleteQuiz);

export default router;