import { Router } from 'express';
import { getPosts, createPost, upvotePost, addReply, deletePost, togglePin } from '../controllers/post.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true }); // mergeParams to get groupId

router.get('/', requireAuth, getPosts);
router.post('/', requireAuth, createPost);
router.patch('/:postId/upvote', requireAuth, upvotePost);
router.post('/:postId/replies', requireAuth, addReply);
router.delete('/:postId', requireAuth, deletePost);
router.patch('/:postId/pin', requireAuth, requireRole('teacher', 'admin'), togglePin);

export default router;