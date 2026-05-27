import { Queue } from 'bullmq';
import { redisForBull } from '../services/redis';

export interface GenerationJobData {
  assignmentId: string;
  title: string;
  subject: string;
  grade: string;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  additionalInstructions?: string;
  fileContent?: string; // extracted text from uploaded PDF
}

export const generationQueue = new Queue<GenerationJobData>('generation', {
  connection: redisForBull,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
