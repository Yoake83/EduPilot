import { safeRouter } from '../middleware/safe-router';
import { getTeacherAnalytics, getStudentAnalytics } from '../controllers/analytics.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = safeRouter();

router.get('/teacher', requireAuth, requireRole('teacher', 'admin'), getTeacherAnalytics);
router.get('/student', requireAuth, requireRole('student'), getStudentAnalytics);

export default router;