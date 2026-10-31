import type { Request, Response, NextFunction } from 'express';
import { redisForBull, queueRedisCompatible } from '../services/redis';
export function requireAI(_req:Request,res:Response,next:NextFunction) {
 if (!process.env.GROQ_API_KEY) return res.status(503).json({error:'AI features are not configured. Set GROQ_API_KEY on the backend.'});
 next();
}
export function requireQueue(_req:Request,res:Response,next:NextFunction) {
 if (redisForBull.status !== 'ready' || !queueRedisCompatible) return res.status(503).json({error:'Generation is temporarily unavailable. Connect a compatible Redis server (version 5 or newer).'});
 next();
}
