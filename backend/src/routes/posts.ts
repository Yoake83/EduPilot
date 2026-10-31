import { safeRouter } from '../middleware/safe-router';
import { getPosts, createPost, upvotePost, addReply, deletePost, togglePin } from '../controllers/post.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

import { requireGroupAccess } from '../middleware/group-access';
const router = safeRouter({ mergeParams: true }); // mergeParams to get groupId

router.get('/', requireAuth, requireGroupAccess, getPosts);
router.post('/', requireAuth, requireGroupAccess, createPost);
router.patch('/:postId/upvote', requireAuth, requireGroupAccess, upvotePost);
router.post('/:postId/replies', requireAuth, requireGroupAccess, addReply);
router.delete('/:postId', requireAuth, requireGroupAccess, deletePost);
router.patch('/:postId/pin', requireAuth, requireGroupAccess, requireRole('teacher', 'admin'), togglePin);

export default router;
