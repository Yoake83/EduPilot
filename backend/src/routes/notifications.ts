import { safeRouter } from '../middleware/safe-router';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = safeRouter();

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markAsRead); // id can be 'all'
router.delete('/:id', requireAuth, deleteNotification);

export default router;