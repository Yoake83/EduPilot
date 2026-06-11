import { Queue } from 'bullmq';
import { redisForBull } from '../services/redis';
import type { QuizQuestionType } from '../models/Quiz';

export interface QuizJobData {
  quizId: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  questionTypes: QuizQuestionType[];
  totalQuestions: number;
  fileContent?: string;
}

export const quizQueue = new Queue<QuizJobData>('quiz-generation', {
  connection: redisForBull,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});