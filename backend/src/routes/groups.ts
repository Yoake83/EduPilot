import { Router } from 'express';
import {
  createGroup, joinGroup, getMyGroups, getGroup,
  leaveGroup, deleteGroup, removeStudent,
} from '../controllers/group.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// IMPORTANT: specific routes MUST come before /:id
router.get('/', requireAuth, getMyGroups);
router.post('/create', requireAuth, requireRole('teacher', 'admin'), createGroup);
router.post('/join', requireAuth, joinGroup); // removed requireRole so any non-teacher can join
router.delete('/leave/:id', requireAuth, leaveGroup);

// Dynamic routes last
router.get('/:id', requireAuth, getGroup);
router.delete('/:id', requireAuth, deleteGroup);
router.delete('/:id/students/:studentId', requireAuth, requireRole('teacher', 'admin'), removeStudent);

export default router;