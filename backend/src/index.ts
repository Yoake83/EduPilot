import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './services/db';
import { initWebSocket } from './websocket/server';
import assignmentRoutes from './routes/assignments';
import generationRoutes from './routes/generation';
import authRoutes from './routes/auth';
import quizRoutes from './routes/quiz';
import submissionRoutes from './routes/submissions';
import groupRoutes from './routes/groups';
import notificationRoutes from './routes/notifications';
import postRoutes from './routes/posts';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/generation', generationRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/groups/:groupId/posts', postRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  initWebSocket(server);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(console.error);