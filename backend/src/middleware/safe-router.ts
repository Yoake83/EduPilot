import { Router, RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
export function safeRouter(options?: Parameters<typeof Router>[0]) {
 const router = Router(options);
 for (const name of ['id','assignmentId','submissionId','groupId','postId','studentId']) router.param(name, (_req,res,next,value) => isValidObjectId(value) ? next() : res.status(400).json({error:'Invalid resource ID'}));
 for (const method of ['get','post','patch','delete','put'] as const) {
  const original = (router[method] as any).bind(router);
  (router as any)[method] = (path: any, ...handlers: RequestHandler[]) => original(path, ...handlers.map(handler => (req:any,res:any,next:any) => { try { Promise.resolve(handler(req,res,next)).catch(next); } catch(error) { next(error); } }));
 }
 return router;
}
