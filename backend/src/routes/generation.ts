import { Router } from 'express';
import { generationQueue } from '../queues/generation.queue';

const router = Router();

router.get('/status/:jobId', async (req, res) => {
  const job = await generationQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const state = await job.getState();
  const progress = job.progress || 0;

  res.json({ jobId: job.id, state, progress });
});

export default router;
