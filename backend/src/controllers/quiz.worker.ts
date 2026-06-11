import 'dotenv/config';
import { Worker } from 'bullmq';
import { redisForBull } from '../services/redis';
import { QuizModel } from '../models/Quiz';
import { generateQuiz } from '../services/quiz.service';
import { connectDB } from '../services/db';
import type { QuizJobData } from '../queues/quiz.queue';

async function start() {
  await connectDB();

  const worker = new Worker<QuizJobData>(
    'quiz-generation',
    async (job) => {
      const { quizId } = job.data;

      await QuizModel.findByIdAndUpdate(quizId, { status: 'processing' });
      await job.updateProgress(10);

      const questions = await generateQuiz(job.data);
      await job.updateProgress(90);

      await QuizModel.findByIdAndUpdate(quizId, {
        status: 'completed',
        questions,
      });

      await job.updateProgress(100);
      console.log(`[quiz worker] Quiz ${quizId} completed with ${questions.length} questions`);
      return questions;
    },
    {
      connection: redisForBull,
      concurrency: 3,
    }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    console.error(`[quiz worker] Job ${job.id} failed:`, err.message);
    await QuizModel.findByIdAndUpdate(job.data.quizId, { status: 'failed' });
  });

  console.log('[quiz worker] started');
}

start().catch(console.error);