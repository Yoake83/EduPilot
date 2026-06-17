import type { Request, Response } from 'express';
import { SubmissionModel } from '../models/Submission';
import { AssignmentModel } from '../models/Assignment';
import { evaluateSubmission } from '../services/evaluator.service';

export async function autoGradeSubmission(req: Request, res: Response) {
  try {
    const { submissionId } = req.params;

    // Get submission
    const submission = await SubmissionModel.findById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Get assignment with question paper
    const assignment = await AssignmentModel.findById(submission.assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Check assignment has a completed question paper with sections
    if (!assignment.result?.sections || assignment.result.sections.length === 0) {
      return res.status(400).json({ error: 'Assignment has no question paper with answer keys' });
    }

    // Only teacher who owns the assignment can auto-grade
    if (assignment.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log(`[evaluator] Auto-grading submission ${submissionId} for assignment ${assignment.title}`);

    // Run AI evaluation
    const result = await evaluateSubmission(
      submission.filePath,
      assignment.result.sections
    );

    console.log(`[evaluator] Done — ${result.totalMarks}/${result.maxMarks} (${result.percentage}%)`);

    // Return result WITHOUT saving — teacher reviews first
    res.json({ evaluation: result });
  } catch (err) {
    console.error('[evaluator] error:', err);
    res.status(500).json({ error: 'AI evaluation failed — please grade manually' });
  }
}