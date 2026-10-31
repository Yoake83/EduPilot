import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import type { AuthPayload } from '../middleware/auth.middleware';
import { AssignmentModel } from '../models/Assignment';
import type { WSMessage } from '../types';

const rooms = new Map<string, Set<WebSocket>>();
const userSockets = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const assignmentId = url.searchParams.get('assignmentId');
    let user: AuthPayload;
    try {
      user = jwt.verify(url.searchParams.get('token') || '', process.env.JWT_SECRET || '') as AuthPayload;
      if (!user.userId) throw new Error('Invalid identity');
      if (assignmentId) {
        const assignment = await AssignmentModel.findById(assignmentId);
        // Generation events contain answer keys: restrict them to educators.
        if (!assignment || (user.role !== 'admin' && assignment.createdBy !== user.userId)) throw new Error('Forbidden');
      }
    } catch { ws.close(1008, 'Unauthorized'); return; }
    if (ws.readyState !== WebSocket.OPEN) return;
    const userId = user.userId;

    if (assignmentId) {
      if (!rooms.has(assignmentId)) rooms.set(assignmentId, new Set());
      rooms.get(assignmentId)!.add(ws);
      ws.on('close', () => {
        rooms.get(assignmentId)?.delete(ws);
        if (rooms.get(assignmentId)?.size === 0) rooms.delete(assignmentId);
      });
    }

    if (userId) {
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId)!.add(ws);
      ws.on('close', () => {
        userSockets.get(userId)?.delete(ws);
        if (userSockets.get(userId)?.size === 0) userSockets.delete(userId);
      });
    }

    ws.on('error', console.error);
  });

  console.log('WebSocket server initialized');
}

export function broadcastToAssignment(assignmentId: string, message: WSMessage) {
  const clients = rooms.get(assignmentId);
  if (!clients) return;
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}

export function broadcastToUser(userId: string, message: object) {
  const clients = userSockets.get(userId);
  if (!clients) return;
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}

export function broadcastToGroup(studentIds: string[], message: object) {
  studentIds.forEach((userId) => broadcastToUser(userId, message));
}