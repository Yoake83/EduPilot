import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    await register(req, res);
  } catch (err) {
    console.error('[auth] register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    await login(req, res);
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me  — protected, returns current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    await getMe(req, res);
  } catch (err) {
    console.error('[auth] getMe error:', err);
    res.status(500).json({ error: 'Could not fetch user' });
  }
});

export default router;