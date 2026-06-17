import { Router } from 'express';
import { getTeacherAnalytics, getStudentAnalytics } from '../controllers/analytics.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/teacher', requireAuth, requireRole('teacher', 'admin'), getTeacherAnalytics);
router.get('/student', requireAuth, requireRole('student'), getStudentAnalytics);

export default router;