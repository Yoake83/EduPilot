import { requireQueue } from '../middleware/service-ready';
import { safeRouter } from '../middleware/safe-router';
import { generationQueue } from '../queues/generation.queue';

import { requireAuth } from '../middleware/auth.middleware';
import { AssignmentModel } from '../models/Assignment';
const router = safeRouter();
router.use(requireAuth, requireQueue);

router.get('/status/:jobId', async (req, res) => {
  const job = await generationQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const assignment = await AssignmentModel.findOne({ jobId: req.params.jobId });
  if (!assignment || (req.user!.role !== 'admin' && assignment.createdBy !== req.user!.userId)) return res.status(403).json({ error: 'Access denied' });
  const state = await job.getState();
  const progress = job.progress || 0;

  res.json({ jobId: job.id, state, progress });
});

export default router;
