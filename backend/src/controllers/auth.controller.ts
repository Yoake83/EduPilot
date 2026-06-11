import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'teacher', 'admin']).default('student'),
  department: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(userId: string, email: string, role: string, name: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.sign({ userId, email, role, name }, secret, { expiresIn: '7d' });
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { name, email, password, role, department } = parsed.data;
  const existing = await UserModel.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const { hash, salt } = (UserModel as any).hashPassword(password);
  const user = await UserModel.create({ name, email, passwordHash: hash, passwordSalt: salt, role, department });
  const token = signToken(user._id.toString(), user.email, user.role, user.name);

  return res.status(201).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = (user as any).verifyPassword(password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = signToken(user._id.toString(), user.email, user.role, user.name);
  return res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
  });
}

export async function getMe(req: Request, res: Response) {
  const user = await UserModel.findById(req.user!.userId).select('-passwordHash -passwordSalt');
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
}