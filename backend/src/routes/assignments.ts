import { Router } from 'express';
import multer from 'multer';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.post('/', upload.single('file'), createAssignment);
router.delete('/:id', deleteAssignment);

export default router;
