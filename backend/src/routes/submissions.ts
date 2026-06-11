import { Router } from 'express';
import multer from 'multer';
import {
  submitAssignment,
  getSubmissionsForAssignment,
  getMySubmission,
  gradeSubmission,
  getAllSubmissions,
} from '../controllers/submission.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });

// Student routes
router.post('/:assignmentId/submit', requireAuth, upload.single('file'), submitAssignment);
router.get('/:assignmentId/my', requireAuth, getMySubmission);

// Teacher/Admin routes
router.get('/:assignmentId/all', requireAuth, requireRole('teacher', 'admin'), getSubmissionsForAssignment);
router.patch('/:submissionId/grade', requireAuth, requireRole('teacher', 'admin'), gradeSubmission);
router.get('/', requireAuth, requireRole('teacher', 'admin'), getAllSubmissions);

export default router;