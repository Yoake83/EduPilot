import { Router } from 'express';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markAsRead); // id can be 'all'
router.delete('/:id', requireAuth, deleteNotification);

export default router;