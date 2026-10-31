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
const { QuizModel } = require('../dist/models/Quiz');
const quizController = require('../dist/controllers/quiz.controller');
const { StudyMaterialModel } = require('../dist/models/StudyMaterial');
const { askQuestion } = require('../dist/controllers/study.controller');
function response() { return { code:200, body:null, status(code) { this.code=code;return this; },json(body) { this.body=body;return this; } }; }
test('quiz deletion rejects another owner without deleting',async()=>{
 const read=QuizModel.findById,del=QuizModel.findByIdAndDelete;
 let deleted=false;
 try { QuizModel.findById=async()=>({createdBy:'owner'});QuizModel.findByIdAndDelete=async()=>{deleted=true};const res=response();await quizController.deleteQuiz({params:{id:'test'},user:{userId:'outsider',role:'teacher'}},res);assert.equal(res.code,403);assert.equal(deleted,false); }
 finally {QuizModel.findById=read;QuizModel.findByIdAndDelete=del;}
});
test('private study retrieval rejects non-owner before AI call',async()=>{
 const original=StudyMaterialModel.findById;
 try {StudyMaterialModel.findById=async()=>({uploadedBy:'owner',chunks:[{text:'private',index:0}]});const res=response();await askQuestion({body:{materialId:'test',question:'What is here?'},user:{userId:'outsider',role:'student'}},res);assert.equal(res.code,403);}
 finally {StudyMaterialModel.findById=original;}
});
test('safe router catches rejected async handlers and validates resource IDs',async()=>{
 const express=require('express');const {safeRouter}=require('../dist/middleware/safe-router');const app=express();const router=safeRouter();router.get('/error',async()=>{throw new Error('expected')});router.get('/:id',(_req,res)=>res.json({ok:true}));app.use(router);app.use((_error,_req,res,_next)=>res.status(500).json({error:'handled'}));const server=app.listen(0,'127.0.0.1');await once(server,'listening');try{const base=`http://127.0.0.1:${server.address().port}`;assert.equal((await fetch(base+'/error')).status,500);assert.equal((await fetch(base+'/invalid')).status,400);assert.equal((await fetch(base+'/507f1f77bcf86cd799439011')).status,200);}finally{await new Promise(resolve=>server.close(resolve));}
});

require('node:test').after(async()=>{
 await require('../dist/queues/quiz.queue').quizQueue.close().catch(() => {});
 const {redis,redisForBull}=require('../dist/services/redis');
 redis.disconnect();redisForBull.disconnect();
});
