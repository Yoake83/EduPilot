import { Router } from 'express';
import multer from 'multer';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', requireAuth, getAssignments);
router.get('/:id', requireAuth, getAssignment);
router.post('/', requireAuth, upload.single('file'), createAssignment);
router.delete('/:id', requireAuth, deleteAssignment);

export default router;