import type { Request, Response } from 'express';
import { SubmissionModel } from '../models/Submission';
import { AssignmentModel } from '../models/Assignment';
import { canReadAssignment } from '../services/access.service';
import { sendNotification } from '../services/notification.service';

export async function submitAssignment(req: Request, res: Response) {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user?.userId;
    const studentName = req.user?.name || req.user?.email?.split('@')[0] || 'Student';

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const assignment = await AssignmentModel.findById(assignmentId).populate('groupId', 'teacherId name students');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (!await canReadAssignment(req.user!, assignment)) return res.status(403).json({ error: 'Access denied' });
    const existing = await SubmissionModel.findOne({ assignmentId, studentId });
    if (existing) {
      existing.filePath = req.file.path;
      existing.fileName = req.file.originalname;
      existing.fileSize = req.file.size;
      existing.status = 'submitted';
      existing.grade = undefined;
      existing.maxGrade = undefined;
      existing.feedback = undefined;
      existing.gradedAt = undefined;
      existing.gradedBy = undefined;
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
    const assignment = await AssignmentModel.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (req.user!.role !== 'admin' && assignment.createdBy !== req.user!.userId) return res.status(403).json({ error: 'Access denied' });
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

    const existing = await SubmissionModel.findById(req.params.submissionId);
    if (!existing) return res.status(404).json({ error: 'Submission not found' });
    const assignment = await AssignmentModel.findById(existing.assignmentId);
    if (!assignment || (req.user!.role !== 'admin' && assignment.createdBy !== req.user!.userId)) return res.status(403).json({ error: 'Access denied' });
    if (!Number.isFinite(Number(grade)) || !Number.isFinite(Number(maxGrade)) || Number(maxGrade) <= 0 || Number(grade) < 0 || Number(grade) > Number(maxGrade)) return res.status(400).json({ error: 'Invalid grade' });
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

export async function getAllSubmissions(req: Request, res: Response) {
  try {
    const assignments = await AssignmentModel.find({ createdBy: req.user!.userId }).select("_id");
    const submissions = await SubmissionModel.find(req.user!.role === "admin" ? {} : { assignmentId: { $in: assignments.map(a => a._id) } })
      .populate('assignmentId', 'title subject grade')
      .sort({ createdAt: -1 }).limit(100);
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}