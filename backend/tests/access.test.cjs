const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canReadAssignment } = require('../dist/services/access.service');
const { GroupModel } = require('../dist/models/Group');
const { register } = require('../dist/controllers/auth.controller');
test('public signup rejects admin before database access', async () => {
 let status;
 const res = { status(n) { status = n; return this; }, json() {} };
 await register({ body: { name: 'Test', email: 'test@example.com', password: 'password123', role: 'admin' } }, res);
 assert.equal(status, 400);
});
test('assignment access requires ownership or student membership', async () => {
 const assignment = { createdBy: 'owner', groupId: 'class' };
 assert.equal(await canReadAssignment({ role: 'teacher', userId: 'other' }, assignment), false);
 assert.equal(await canReadAssignment({ role: 'teacher', userId: 'owner' }, assignment), true);
 assert.equal(await canReadAssignment({ role: 'student', userId: 'student' }, { createdBy: 'owner' }), false);
 const original = GroupModel.exists;
 try {
  GroupModel.exists = async filter => { assert.equal(filter['students.userId'], 'student'); return null; };
  assert.equal(await canReadAssignment({ role: 'student', userId: 'student' }, assignment), false);
  GroupModel.exists = async () => ({ _id: 'class' });
  assert.equal(await canReadAssignment({ role: 'student', userId: 'student' }, assignment), true);
 } finally { GroupModel.exists = original; }
});
const http = require('node:http');
const { once } = require('node:events');
const jwt = require('jsonwebtoken');
const { WebSocket } = require('ws');
const { initWebSocket, broadcastToUser } = require('../dist/websocket/server');
test('WebSocket rejects missing tokens and derives notification identity from JWT', async () => {
 process.env.JWT_SECRET = 'test-only-secret';
 const server = http.createServer();
 initWebSocket(server);
 server.listen(0, '127.0.0.1'); await once(server, 'listening');
 const base = `ws://127.0.0.1:${server.address().port}/ws`;
 const unauth = new WebSocket(base + '?userId=victim');
 const closed = once(unauth, 'close');
 unauth.on('open', () => unauth.send(JSON.stringify({ type: 'authenticate', token: '' })));
 assert.equal((await closed)[0], 1008);
 const token = jwt.sign({ userId: 'actual', role: 'student' }, process.env.JWT_SECRET);
 const ws = new WebSocket(base + '?userId=victim');
 await once(ws, 'open');
 const ready = once(ws, 'message');
 ws.send(JSON.stringify({ type: 'authenticate', token }));
 await ready;
 const received = once(ws, 'message');
 broadcastToUser('victim', { leaked: true });
 broadcastToUser('actual', { correct: true });
 assert.deepEqual(JSON.parse((await received)[0].toString()), { correct: true });
 ws.close(); await once(ws, 'close');
 await new Promise(resolve => server.close(resolve));
});
