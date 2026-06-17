# EduPilot 

> AI-powered educational platform that brings together AI-assisted teaching tools, classroom management, and student analytics into one cohesive system — built solo as a full-stack engineering project.

**Live Demo:** https://edu-pilot-nine.vercel.app/(#) · **Backend API:** [edupilot-dmy4.onrender.com](#)

---

##  Overview

EduPilot is a Google Classroom-style platform enhanced with AI at every layer — from generating question papers and quizzes to auto-grading submissions and powering a RAG-based study assistant that answers questions strictly from a student's own notes.

It supports three roles (**Student**, **Teacher**, **Admin**) with completely separate dashboards, permissions, and workflows, backed by a real-time notification system and a production-grade async job pipeline for AI generation.

---

##  Core Features

###  AI-Powered Tools
- **AI Question Paper Generator** — Upload a syllabus/notes PDF (or just describe a topic) and get a fully structured exam paper with sections, difficulty tagging, and an answer key — generated asynchronously via Groq (Llama 3.3 70B).
- **AI Quiz Generator** — Generates MCQs, True/False, and Fill-in-the-blank questions from any topic or uploaded material, with instant reveal-to-check answers.
- **AI Auto-Grader** — Teachers can trigger one-click AI evaluation on a student's submitted answer sheet. The model reads the original question paper's answer key, scores each question individually, and pre-fills a grading form with marks + feedback for teacher review.
- **RAG Study Assistant** — Students upload their own PDF notes; the system chunks and indexes the content, then answers natural-language questions **strictly from that material** — refusing to hallucinate beyond the uploaded source.

###  Classroom Management
- **Groups (Classes)** — Teachers create classes and get a shareable 6-character join code, à la Google Classroom. Students can join multiple classes from multiple teachers.
- **Assignment Pipeline** — Full lifecycle from creation → AI generation → student submission → grading → feedback, with live status tracking.
- **Discussion Forum** — Per-class Q&A board with upvotes, threaded replies, tags, and teacher-pinned posts.

###  Analytics & Insights
- **Teacher Dashboard** — Class-wide submission rates, grade distribution (donut chart), weekly submission trends, and per-class performance breakdown — all rendered with hand-built SVG charts (zero charting dependencies).
- **Student Dashboard** — Personal grade trend across assignments, submission status breakdown, and per-assignment performance history.

###  Real-Time Systems
- **WebSocket Notifications** — Instant push notifications for new assignments, graded submissions, and new student submissions — no polling.
- **Live Generation Progress** — Question paper/quiz generation status streams to the frontend in real time via WebSocket as the background worker processes the job.

###  Auth & Roles
- JWT-based authentication with bcrypt-equivalent password hashing (PBKDF2)
- Three distinct roles with route-level and UI-level permission enforcement
- Persistent sessions with automatic token refresh handling

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Zustand for state management
- Custom SVG-based charting (no Chart.js/Recharts dependency)
- WebSocket client for real-time updates

**Backend**
- Node.js · Express · TypeScript
- MongoDB + Mongoose (multi-model relational design: Users, Groups, Assignments, Submissions, Quizzes, Posts, Notifications, StudyMaterial)
- BullMQ + Redis (Upstash) for async AI job processing
- Groq SDK (Llama 3.3 70B Versatile) for all AI generation and evaluation
- JWT + custom crypto-based password hashing
- `ws` for native WebSocket server (per-user and per-job rooms)
- `pdf-parse` for PDF text extraction (used in question generation, RAG indexing, and auto-grading)

**Infrastructure**
- Frontend deployed on **Vercel**
- Backend deployed on **Render**
- MongoDB Atlas (cloud)
- Upstash Redis (cloud, TLS)

**DevOps practices**
- Separate worker processes for assignment generation and quiz generation (horizontally scalable)
- Environment-based configuration for local vs. production (WSL Redis locally, Upstash in production)
- Structured error handling and logging across all async job pipelines

---

##  Architecture Highlights

**Custom RAG Pipeline (No Vector DB)**
Rather than depending on ChromaDB/Pinecone, the study assistant implements a lightweight TF-IDF-based chunk retrieval system directly in Node.js — chunking uploaded PDFs into overlapping segments, scoring relevance against the user's question, and feeding only the top-k relevant chunks into the LLM context window. This keeps the AI's answers grounded in the source material with zero additional infrastructure.

**Async Job Architecture**
All AI generation (question papers, quizzes) runs through a BullMQ queue with a dedicated worker process, decoupling the Express API from long-running LLM calls. The frontend polls/subscribes via WebSocket for real-time progress instead of blocking on a single request.

**Role-Scoped Data Access**
Every query is scoped at the controller level by role — teachers only see assignments and submissions tied to their own groups; students only see assignments from groups they've explicitly joined — enforced server-side, not just hidden in the UI.

---

##  Screenshots

| Teacher Dashboard | Student Dashboard |
|---|---|
| *[screenshot placeholder]* | *[screenshot placeholder]* |

| AI Question Generator | RAG Study Assistant |
|---|---|
| *[screenshot placeholder]* | *[screenshot placeholder]* |

| Analytics Dashboard | Discussion Forum |
|---|---|
| *[screenshot placeholder]* | *[screenshot placeholder]* |

| AI Auto-Grading | Quiz Generator |
|---|---|
| *[screenshot placeholder]* | *[screenshot placeholder]* |

---

##  Key Engineering Decisions

- **Why BullMQ over synchronous API calls?** LLM generation can take 10–30+ seconds; blocking the request thread for that long doesn't scale. A queue + worker model keeps the API responsive and makes the system horizontally scalable.
- **Why a custom TF-IDF retrieval instead of embeddings?** For a single-user-scoped document corpus (a student's own notes), full vector embeddings are overkill. TF-IDF chunk scoring is fast, requires no external embedding API calls, and is "good enough" for the retrieval quality this use case needs.
- **Why role enforcement at the controller, not just the UI?** Hiding a button in React doesn't stop someone from hitting the API directly. Every sensitive route checks `req.user.role` and ownership server-side before returning data.

---

## Author

Built by **Devika Soni** — B.Tech Computer Science, IIIT Senapati
GitHub: [@Yoake83](https://github.com/Yoake83)

---

##  License

This project is for educational and portfolio purposes.
