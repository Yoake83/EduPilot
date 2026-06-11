import type { Request, Response } from 'express';
import { QuizModel } from '../models/Quiz';
import { quizQueue } from '../queues/quiz.queue';
import fs from 'fs/promises';
import type { QuizQuestionType } from '../models/Quiz';

async function extractFileText(filePath?: string): Promise<string | undefined> {
  if (!filePath) return undefined;
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch {
    return undefined;
  }
}

export async function createQuiz(req: Request, res: Response) {
  try {
    const { title, subject, grade, topic, questionTypes, totalQuestions } = req.body;

    if (!title || !subject || !grade || !topic || !questionTypes || !totalQuestions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedTypes: QuizQuestionType[] =
      typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes;

    const parsedTotal = Number(totalQuestions);
    if (parsedTotal < 1 || parsedTotal > 50) {
      return res.status(400).json({ error: 'Total questions must be between 1 and 50' });
    }

    const filePath = req.file?.path;
    const fileContent = await extractFileText(filePath);

    const quiz = await QuizModel.create({
      title,
      subject,
      grade,
      topic,
      questionTypes: parsedTypes,
      totalQuestions: parsedTotal,
      status: 'pending',
      fileContent,
      createdBy: req.user?.userId,
    });

    const job = await quizQueue.add('generate-quiz', {
      quizId: quiz._id.toString(),
      title,
      subject,
      grade,
      topic,
      questionTypes: parsedTypes,
      totalQuestions: parsedTotal,
      fileContent,
    });

    await QuizModel.findByIdAndUpdate(quiz._id, { jobId: job.id });

    res.status(201).json({ quiz: { ...quiz.toObject(), jobId: job.id } });
  } catch (err) {
    console.error('[quiz] create error:', err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
}

export async function getQuizzes(_req: Request, res: Response) {
  const quizzes = await QuizModel.find()
    .select('-questions -fileContent')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ quizzes });
}

export async function getQuiz(req: Request, res: Response) {
  const quiz = await QuizModel.findById(req.params.id).select('-fileContent');
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ quiz });
}

export async function deleteQuiz(req: Request, res: Response) {
  await QuizModel.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}