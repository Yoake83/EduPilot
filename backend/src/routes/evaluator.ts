import { Router } from 'express';
import { autoGradeSubmission } from '../controllers/evaluator.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// POST /api/evaluate/:submissionId
router.post('/:submissionId', requireAuth, requireRole('teacher', 'admin'), autoGradeSubmission);

export default router;