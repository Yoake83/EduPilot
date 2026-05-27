import 'dotenv/config';
import { Worker } from 'bullmq';
import { redisForBull } from '../services/redis';
import { AssignmentModel } from '../models/Assignment';
import { generatePaper } from '../services/ai.service';
import { broadcastToAssignment } from '../websocket/server';
import { connectDB } from '../services/db';
import type { GenerationJobData } from '../queues/generation.queue';

async function start() {
  await connectDB();

  const worker = new Worker<GenerationJobData>(
    'generation',
    async (job) => {
      const { assignmentId } = job.data;

      // Mark as processing
      await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'processing' });

      broadcastToAssignment(assignmentId, {
        type: 'job:progress',
        payload: { assignmentId, progress: 10 },
      });

      await job.updateProgress(10);

      // Generate paper
      broadcastToAssignment(assignmentId, {
        type: 'job:progress',
        payload: { assignmentId, progress: 40 },
      });

      const result = await generatePaper(job.data);

      await job.updateProgress(80);

      broadcastToAssignment(assignmentId, {
        type: 'job:progress',
        payload: { assignmentId, progress: 80 },
      });

      // Store result
      await AssignmentModel.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        result,
      });

      await job.updateProgress(100);

      broadcastToAssignment(assignmentId, {
        type: 'job:completed',
        payload: { assignmentId, result },
      });

      return result;
    },
    {
      connection: redisForBull,
      concurrency: 3,
    }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId } = job.data;
    console.error(`Job ${job.id} failed:`, err.message);

    await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'failed' });

    broadcastToAssignment(assignmentId, {
      type: 'job:failed',
      payload: { assignmentId, error: err.message },
    });
  });

  console.log('Worker started');
}

start().catch(console.error);
