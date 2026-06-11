import type { Request, Response } from 'express';
import { GroupModel } from '../models/Group';
import { AssignmentModel } from '../models/Assignment';

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createGroup(req: Request, res: Response) {
  try {
    const { name, subject, description, teacherName } = req.body;
    if (!name || !subject) {
      return res.status(400).json({ error: 'Name and subject are required' });
    }

    let joinCode = generateJoinCode();
    let exists = await GroupModel.findOne({ joinCode });
    while (exists) {
      joinCode = generateJoinCode();
      exists = await GroupModel.findOne({ joinCode });
    }

    const group = await GroupModel.create({
      name,
      subject,
      description,
      teacherId: req.user!.userId,
      teacherName: teacherName || req.user!.name || 'Teacher',
      joinCode,
      students: [],
    });

    console.log('[group] created:', group._id, 'by teacher:', req.user!.userId);
    res.status(201).json({ group });
  } catch (err) {
    console.error('[group] create error:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
}

export async function joinGroup(req: Request, res: Response) {
  try {
    const { joinCode, studentName } = req.body;
    if (!joinCode) return res.status(400).json({ error: 'Join code is required' });

    const group = await GroupModel.findOne({ joinCode: joinCode.toUpperCase() });
    if (!group) return res.status(404).json({ error: 'Invalid join code — group not found' });

    const alreadyJoined = group.students.some((s) => s.userId === req.user!.userId);
    if (alreadyJoined) return res.status(409).json({ error: 'Already in this group' });

    if (group.teacherId === req.user!.userId) {
      return res.status(400).json({ error: 'You are the teacher of this group' });
    }

    group.students.push({
      userId: req.user!.userId,
      name: studentName || req.user!.name || req.user!.email.split('@')[0],
      email: req.user!.email,
      joinedAt: new Date(),
    });

    await group.save();
    res.json({ group });
  } catch (err) {
    console.error('[group] join error:', err);
    res.status(500).json({ error: 'Failed to join group' });
  }
}

export async function getMyGroups(req: Request, res: Response) {
  try {
    const { role, userId } = req.user!;
    let groups;

    if (role === 'teacher' || role === 'admin') {
      groups = await GroupModel.find({ teacherId: userId }).sort({ createdAt: -1 });
    } else {
      groups = await GroupModel.find({ 'students.userId': userId }).sort({ createdAt: -1 });
    }

    console.log(`[group] getMyGroups for ${userId} (${role}): found ${groups.length}`);
    res.json({ groups });
  } catch (err) {
    console.error('[group] getMyGroups error:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
}

export async function getGroup(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId, role } = req.user!;

    console.log('[group] getGroup id:', id, 'userId:', userId, 'role:', role);

    const group = await GroupModel.findById(id);
    if (!group) {
      console.log('[group] not found in DB for id:', id);
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check access — compare as strings
    const isTeacher = group.teacherId.toString() === userId.toString();
    const isStudent = group.students.some((s) => s.userId.toString() === userId.toString());
    const isAdmin = role === 'admin';

    console.log('[group] access check — isTeacher:', isTeacher, 'isStudent:', isStudent, 'isAdmin:', isAdmin);

    if (!isTeacher && !isStudent && !isAdmin) {
      return res.status(403).json({ error: 'Access denied — you are not a member of this group' });
    }

    const assignments = await AssignmentModel.find({ groupId: group._id }).sort({ createdAt: -1 });
    console.log('[group] found', assignments.length, 'assignments for group', group._id);

    res.json({ group, assignments });
  } catch (err) {
    console.error('[group] getGroup error:', err);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
}

export async function leaveGroup(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const group = await GroupModel.findById(id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    group.students = group.students.filter((s) => s.userId !== req.user!.userId);
    await group.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('[group] leave error:', err);
    res.status(500).json({ error: 'Failed to leave group' });
  }
}

export async function deleteGroup(req: Request, res: Response) {
  try {
    const group = await GroupModel.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.teacherId !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    await GroupModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[group] delete error:', err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
}

export async function removeStudent(req: Request, res: Response) {
  try {
    const { id, studentId } = req.params;
    const group = await GroupModel.findById(id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.teacherId !== req.user!.userId) {
      return res.status(403).json({ error: 'Only the teacher can remove students' });
    }
    group.students = group.students.filter((s) => s.userId !== studentId);
    await group.save();
    res.json({ group });
  } catch (err) {
    console.error('[group] removeStudent error:', err);
    res.status(500).json({ error: 'Failed to remove student' });
  }
}