import type { Request, Response } from 'express';
import { AssignmentModel } from '../models/Assignment';
import { SubmissionModel } from '../models/Submission';
import { GroupModel } from '../models/Group';
import { UserModel } from '../models/User';

export async function getTeacherAnalytics(req: Request, res: Response) {
  try {
    const teacherId = req.user!.userId;

    // Get all teacher's groups
    const groups = await GroupModel.find({ teacherId });
    const groupIds = groups.map(g => g._id);
    const totalStudents = groups.reduce((sum, g) => sum + g.students.length, 0);

    // Get all assignments
    const assignments = await AssignmentModel.find({ createdBy: teacherId });
    const assignmentIds = assignments.map(a => a._id);

    // Get all submissions for those assignments
    const submissions = await SubmissionModel.find({ assignmentId: { $in: assignmentIds } });

    // Submission rate per assignment
    const submissionsByAssignment = assignments.map(a => {
      const subs = submissions.filter(s => s.assignmentId.toString() === a._id.toString());
      const graded = subs.filter(s => s.status === 'graded');
      const avgGrade = graded.length > 0
        ? graded.reduce((sum, s) => sum + ((s.grade || 0) / (s.maxGrade || 100)) * 100, 0) / graded.length
        : null;

      return {
        _id: a._id,
        title: a.title.length > 25 ? a.title.slice(0, 25) + '…' : a.title,
        subject: a.subject,
        totalStudents,
        submitted: subs.length,
        graded: graded.length,
        submissionRate: totalStudents > 0 ? Math.round((subs.length / totalStudents) * 100) : 0,
        avgGrade: avgGrade !== null ? Math.round(avgGrade) : null,
        dueDate: a.dueDate,
        status: a.status,
      };
    });

    // Grade distribution across all graded submissions
    const gradedSubs = submissions.filter(s => s.status === 'graded' && s.grade !== undefined);
    const gradeDistribution = [
      { range: '90-100', count: gradedSubs.filter(s => ((s.grade || 0) / (s.maxGrade || 100)) * 100 >= 90).length },
      { range: '75-89', count: gradedSubs.filter(s => { const p = ((s.grade || 0) / (s.maxGrade || 100)) * 100; return p >= 75 && p < 90; }).length },
      { range: '60-74', count: gradedSubs.filter(s => { const p = ((s.grade || 0) / (s.maxGrade || 100)) * 100; return p >= 60 && p < 75; }).length },
      { range: '40-59', count: gradedSubs.filter(s => { const p = ((s.grade || 0) / (s.maxGrade || 100)) * 100; return p >= 40 && p < 60; }).length },
      { range: '0-39',  count: gradedSubs.filter(s => ((s.grade || 0) / (s.maxGrade || 100)) * 100 < 40).length },
    ];

    // Submissions over time (last 7 days)
    const now = new Date();
    const submissionsOverTime = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = submissions.filter(s => {
        const d = new Date(s.createdAt);
        return d.toDateString() === date.toDateString();
      }).length;
      return { day: dayStr, count };
    });

    // Per-group stats
    const groupStats = groups.map(g => {
      const groupAssignments = assignments.filter(a => a.groupId?.toString() === g._id.toString());
      const groupSubs = submissions.filter(s =>
        groupAssignments.some(a => a._id.toString() === s.assignmentId.toString())
      );
      const groupGraded = groupSubs.filter(s => s.status === 'graded');
      const avg = groupGraded.length > 0
        ? Math.round(groupGraded.reduce((sum, s) => sum + ((s.grade || 0) / (s.maxGrade || 100)) * 100, 0) / groupGraded.length)
        : null;

      return {
        _id: g._id,
        name: g.name,
        subject: g.subject,
        students: g.students.length,
        assignments: groupAssignments.length,
        submissions: groupSubs.length,
        avgGrade: avg,
      };
    });

    // Overall stats
    const overallAvg = gradedSubs.length > 0
      ? Math.round(gradedSubs.reduce((sum, s) => sum + ((s.grade || 0) / (s.maxGrade || 100)) * 100, 0) / gradedSubs.length)
      : null;

    res.json({
      overview: {
        totalGroups: groups.length,
        totalStudents,
        totalAssignments: assignments.length,
        totalSubmissions: submissions.length,
        gradedSubmissions: gradedSubs.length,
        overallAvgGrade: overallAvg,
        submissionRate: totalStudents > 0 && assignments.length > 0
          ? Math.round((submissions.length / (totalStudents * assignments.length)) * 100)
          : 0,
      },
      submissionsByAssignment: submissionsByAssignment.slice(0, 10),
      gradeDistribution,
      submissionsOverTime,
      groupStats,
    });
  } catch (err) {
    console.error('[analytics] error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

export async function getStudentAnalytics(req: Request, res: Response) {
  try {
    const studentId = req.user!.userId;

    // Get joined groups
    const groups = await GroupModel.find({ 'students.userId': studentId });
    const groupIds = groups.map(g => g._id);

    // Get assignments from those groups
    const assignments = await AssignmentModel.find({ groupId: { $in: groupIds } });
    const assignmentIds = assignments.map(a => a._id);

    // Get student's submissions
    const submissions = await SubmissionModel.find({
      assignmentId: { $in: assignmentIds },
      studentId,
    });

    const gradedSubs = submissions.filter(s => s.status === 'graded');
    const avgGrade = gradedSubs.length > 0
      ? Math.round(gradedSubs.reduce((sum, s) => sum + ((s.grade || 0) / (s.maxGrade || 100)) * 100, 0) / gradedSubs.length)
      : null;

    // Per-assignment performance
    const assignmentPerformance = assignments.map(a => {
      const sub = submissions.find(s => s.assignmentId.toString() === a._id.toString());
      return {
        title: a.title.length > 20 ? a.title.slice(0, 20) + '…' : a.title,
        subject: a.subject,
        submitted: !!sub,
        status: sub?.status || 'not_submitted',
        grade: sub?.grade,
        maxGrade: sub?.maxGrade,
        percentage: sub?.grade !== undefined ? Math.round(((sub.grade || 0) / (sub.maxGrade || 100)) * 100) : null,
        dueDate: a.dueDate,
      };
    });

    // Grade trend over submitted assignments
    const gradeTrend = gradedSubs
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((s, i) => ({
        label: `#${i + 1}`,
        percentage: Math.round(((s.grade || 0) / (s.maxGrade || 100)) * 100),
      }));

    res.json({
      overview: {
        enrolledClasses: groups.length,
        totalAssignments: assignments.length,
        submitted: submissions.length,
        graded: gradedSubs.length,
        pending: assignments.length - submissions.length,
        avgGrade,
      },
      assignmentPerformance,
      gradeTrend,
      groupStats: groups.map(g => ({
        name: g.name,
        subject: g.subject,
        assignments: assignments.filter(a => a.groupId?.toString() === g._id.toString()).length,
      })),
    });
  } catch (err) {
    console.error('[analytics] student error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}