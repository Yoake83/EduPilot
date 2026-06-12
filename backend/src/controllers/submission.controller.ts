import type { Request, Response } from 'express';
import { SubmissionModel } from '../models/Submission';
import { AssignmentModel } from '../models/Assignment';
import { sendNotification } from '../services/notification.service';

export async function submitAssignment(req: Request, res: Response) {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user?.userId;
    const studentName = req.user?.name || req.user?.email?.split('@')[0] || 'Student';

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const assignment = await AssignmentModel.findById(assignmentId).populate('groupId', 'teacherId name');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

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

    // Notify teacher that a student submitted
    const group = assignment.groupId as any;
    if (group?.teacherId) {
      await sendNotification({
        userId: group.teacherId.toString(),
        type: 'submission_received',
        title: '📥 New Submission',
        message: `${studentName} submitted "${assignment.title}"`,
        link: `/assignments/review/${assignmentId}`,
      });
    }

    res.status(201).json({ submission });
  } catch (err) {
    console.error('[submission] submit error:', err);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
}

export async function getSubmissionsForAssignment(req: Request, res: Response) {
  try {
    const submissions = await SubmissionModel.find({ assignmentId: req.params.assignmentId })
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

export async function getMySubmission(req: Request, res: Response) {
  try {
    const submission = await SubmissionModel.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user?.userId,
    });
    res.json({ submission: submission || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
}

export async function gradeSubmission(req: Request, res: Response) {
  try {
    const { grade, maxGrade, feedback } = req.body;
    if (grade === undefined || maxGrade === undefined) {
      return res.status(400).json({ error: 'grade and maxGrade are required' });
    }

    const submission = await SubmissionModel.findByIdAndUpdate(
      req.params.submissionId,
      { grade: Number(grade), maxGrade: Number(maxGrade), feedback, status: 'graded', gradedBy: req.user?.userId, gradedAt: new Date() },
      { new: true }
    );
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Notify student their work was graded
    await sendNotification({
      userId: submission.studentId,
      type: 'assignment_graded',
      title: '✅ Assignment Graded',
      message: `Your submission received ${grade}/${maxGrade}${feedback ? ': ' + feedback.slice(0, 60) : ''}`,
      link: `/assignments/submit/${submission.assignmentId}`,
    });

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
      .sort({ createdAt: -1 }).limit(100);
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}