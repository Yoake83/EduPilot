import { requireAI } from '../middleware/service-ready';
import { safeRouter } from '../middleware/safe-router';
import { autoGradeSubmission } from '../controllers/evaluator.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = safeRouter();

// POST /api/evaluate/:submissionId
router.post('/:submissionId', requireAuth, requireRole('teacher', 'admin'), requireAI, autoGradeSubmission);

export default router;