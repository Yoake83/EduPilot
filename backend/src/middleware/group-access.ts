import type { Request, Response, NextFunction } from 'express';
import { GroupModel } from '../models/Group';
import { PostModel } from '../models/Post';
export async function requireGroupAccess(req:Request,res:Response,next:NextFunction) {
 try {
 const group = await GroupModel.findById(req.params.groupId);
 if (!group) return res.status(404).json({error:'Group not found'});
 if (req.user!.role !== 'admin' && group.teacherId !== req.user!.userId && !group.students.some(s=>s.userId === req.user!.userId)) return res.status(403).json({error:'Access denied'});
 if (req.params.postId && !await PostModel.exists({_id:req.params.postId,groupId:group._id})) return res.status(404).json({error:'Post not found'});
 if ((req.method === 'DELETE' || req.path.endsWith('/pin')) && req.user!.role === 'teacher' && group.teacherId !== req.user!.userId) return res.status(403).json({error:'Access denied'});
 next();
 } catch(error) { next(error); }
}
