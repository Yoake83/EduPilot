import { requireAI, requireQueue } from '../middleware/service-ready';
import { safeRouter } from '../middleware/safe-router';
import multer from 'multer';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = safeRouter();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', requireAuth, getAssignments);
router.get('/:id', requireAuth, getAssignment);
router.post('/', requireAuth, requireRole('teacher', 'admin'), requireQueue, requireAI, upload.single('file'), createAssignment);
router.delete('/:id', requireAuth, deleteAssignment);

export default router;