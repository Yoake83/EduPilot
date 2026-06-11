import type { Request, Response } from 'express';
import { SubmissionModel } from '../models/Submission';
import { AssignmentModel } from '../models/Assignment';
import path from 'path';

export async function submitAssignment(req: Request, res: Response) {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user?.userId;
    const studentName = req.user?.email?.split('@')[0] || 'Student';

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if already submitted — update if so
    const existing = await SubmissionModel.findOne({ assignmentId, studentId });
    if (existing) {
      existing.filePath = req.file.path;
      existing.fileName = req.file.originalname;
      existing.fileSize = req.file.size;
      existing.status = 'submitted';
      await existing.save();
      return res.json({ submission: existing });
    }

    const submission = await SubmissionModel.create({
      assignmentId,
      studentId,
      studentName,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'submitted',
    });

    res.status(201).json({ submission });
  } catch (err) {
    console.error('[submission] submit error:', err);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
}

export async function getSubmissionsForAssignment(req: Request, res: Response) {
  try {
    const { assignmentId } = req.params;
    const submissions = await SubmissionModel.find({ assignmentId }).sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

export async function getMySubmission(req: Request, res: Response) {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user?.userId;
    const submission = await SubmissionModel.findOne({ assignmentId, studentId });
    res.json({ submission: submission || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
}

export async function gradeSubmission(req: Request, res: Response) {
  try {
    const { submissionId } = req.params;
    const { grade, maxGrade, feedback } = req.body;

    if (grade === undefined || maxGrade === undefined) {
      return res.status(400).json({ error: 'grade and maxGrade are required' });
    }

    const submission = await SubmissionModel.findByIdAndUpdate(
      submissionId,
      {
        grade: Number(grade),
        maxGrade: Number(maxGrade),
        feedback,
        status: 'graded',
        gradedBy: req.user?.userId,
        gradedAt: new Date(),
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission });
  } catch (err) {
    console.error('[submission] grade error:', err);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
}

export async function getAllSubmissions(_req: Request, res: Response) {
  try {
    const submissions = await SubmissionModel.find()
      .populate('assignmentId', 'title subject grade')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}