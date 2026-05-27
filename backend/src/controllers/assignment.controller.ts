import type { Request, Response } from 'express';
import { AssignmentModel } from '../models/Assignment';
import { generationQueue } from '../queues/generation.queue';
import { redis } from '../services/redis';
import fs from 'fs/promises';

// Extract text from uploaded PDF (optional)
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

export async function createAssignment(req: Request, res: Response) {
  try {
    const { title, subject, grade, dueDate, questionTypes, additionalInstructions } = req.body;

    // Validate
    if (!title || !subject || !grade || !dueDate || !questionTypes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedQT = typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes;

    // Validate question types
    for (const qt of parsedQT) {
      if (!qt.type || qt.count < 1 || qt.marks < 1) {
        return res.status(400).json({ error: 'Invalid question type configuration' });
      }
    }

    const filePath = req.file?.path;
    const fileContent = await extractFileText(filePath);

    const assignment = await AssignmentModel.create({
      title,
      subject,
      grade,
      dueDate: new Date(dueDate),
      questionTypes: parsedQT,
      additionalInstructions,
      filePath,
      status: 'pending',
    });

    const job = await generationQueue.add('generate', {
      assignmentId: assignment._id.toString(),
      title,
      subject,
      grade,
      questionTypes: parsedQT,
      additionalInstructions,
      fileContent,
    });

    await AssignmentModel.findByIdAndUpdate(assignment._id, { jobId: job.id });

    // Cache job state in Redis
    await redis.setex(
      `job:${job.id}`,
      3600,
      JSON.stringify({ assignmentId: assignment._id.toString(), status: 'waiting' })
    );

    res.status(201).json({
      assignment: { ...assignment.toObject(), jobId: job.id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
}

export async function getAssignments(_req: Request, res: Response) {
  const assignments = await AssignmentModel.find().sort({ createdAt: -1 }).limit(50);
  res.json({ assignments });
}

export async function getAssignment(req: Request, res: Response) {
  const assignment = await AssignmentModel.findById(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  res.json({ assignment });
}

export async function deleteAssignment(req: Request, res: Response) {
  await AssignmentModel.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}
