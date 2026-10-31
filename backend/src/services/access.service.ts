import { GroupModel } from '../models/Group';
import type { AuthPayload } from '../middleware/auth.middleware';
export async function canReadAssignment(user: AuthPayload, assignment: { createdBy: string; groupId?: unknown }) {
  if (user.role === 'admin' || assignment.createdBy === user.userId) return true;
  if (user.role !== 'student' || !assignment.groupId) return false;
  return !!await GroupModel.exists({ _id: assignment.groupId, 'students.userId': user.userId });
}
