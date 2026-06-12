import type { Request, Response } from 'express';
import { AssignmentModel } from '../models/Assignment';
import { GroupModel } from '../models/Group';
import { generationQueue } from '../queues/generation.queue';
import { redis } from '../services/redis';
import { notifyGroupStudents } from '../services/notification.service';
import fs from 'fs/promises';

async function extractFileText(filePath?: string): Promise<string | undefined> {
  if (!filePath) return undefined;
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch { return undefined; }
}

export async function createAssignment(req: Request, res: Response) {
  try {
    const { title, subject, grade, dueDate, questionTypes, additionalInstructions, groupId } = req.body;

    if (!title || !subject || !grade || !dueDate || !questionTypes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedQT = typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes;
    for (const qt of parsedQT) {
      if (!qt.type || qt.count < 1 || qt.marks < 1) {
        return res.status(400).json({ error: 'Invalid question type configuration' });
      }
    }

    let group = null;
    if (groupId) {
      group = await GroupModel.findById(groupId);
      if (!group) return res.status(404).json({ error: 'Group not found' });

      const teacherIdStr = group.teacherId.toString();
      const userIdStr = req.user!.userId.toString();

      if (teacherIdStr !== userIdStr && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'You do not own this group' });
      }
    }

    const filePath = req.file?.path;
    const fileContent = await extractFileText(filePath);

    const assignment = await AssignmentModel.create({
      title, subject, grade,
      dueDate: new Date(dueDate),
      questionTypes: parsedQT,
      additionalInstructions,
      filePath,
      groupId: groupId || undefined,
      status: 'pending',
      createdBy: req.user!.userId,
    });

    const job = await generationQueue.add('generate', {
      assignmentId: assignment._id.toString(),
      title, subject, grade,
      questionTypes: parsedQT,
      additionalInstructions,
      fileContent,
    });

    await AssignmentModel.findByIdAndUpdate(assignment._id, { jobId: job.id });
    await redis.setex(`job:${job.id}`, 3600, JSON.stringify({ assignmentId: assignment._id.toString(), status: 'waiting' }));

    // Notify all students in the group
    if (group && group.students.length > 0) {
      await notifyGroupStudents(group.students, {
        type: 'new_assignment',
        title: '📄 New Assignment',
        message: `${title} has been posted in ${group.name}`,
        link: `/assignments/${assignment._id}`,
      });
    }

    res.status(201).json({ assignment: { ...assignment.toObject(), jobId: job.id } });
  } catch (err) {
    console.error('[assignment] create error:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
}

export async function getAssignments(req: Request, res: Response) {
  try {
    const role = req.user?.role;
    const userId = req.user?.userId;
    let assignments;

    if (role === 'teacher' || role === 'admin') {
      assignments = await AssignmentModel.find({ createdBy: userId })
        .sort({ createdAt: -1 }).limit(50)
        .populate('groupId', 'name subject');
    } else {
      const groups = await GroupModel.find({ 'students.userId': userId });
      const groupIds = groups.map((g) => g._id);
      assignments = await AssignmentModel.find({ groupId: { $in: groupIds } })
        .sort({ createdAt: -1 }).limit(50)
        .populate('groupId', 'name subject teacherName');
    }

    res.json({ assignments });
  } catch (err) {
    console.error('[assignment] getAssignments error:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

export async function getAssignment(req: Request, res: Response) {
  const assignment = await AssignmentModel.findById(req.params.id).populate('groupId', 'name subject');
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  res.json({ assignment });
}

export async function deleteAssignment(req: Request, res: Response) {
  const assignment = await AssignmentModel.findById(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  if (assignment.createdBy !== req.user?.userId && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  await AssignmentModel.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}