import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './services/db';
import { initWebSocket } from './websocket/server';
import assignmentRoutes from './routes/assignments';
import generationRoutes from './routes/generation';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/assignments', assignmentRoutes);
app.use('/api/generation', generationRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  initWebSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);
