# VedaAI – AI Assessment Creator

## Architecture Overview

```
Frontend (Next.js 14) ↔ Backend (Express + TypeScript)
                              ↓
                    BullMQ Queue (Redis)
                              ↓
                    Worker → LLM API → MongoDB
                              ↓
                    WebSocket → Frontend (real-time)
```

## Tech Stack

**Frontend**
- Next.js 14 (App Router) + TypeScript
- Zustand (state management)
- WebSocket (native browser API)
- Tailwind CSS

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Redis + BullMQ (job queue)
- WebSocket (ws library)

**AI**
- Anthropic Claude API (structured prompt → parsed JSON output)

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas URI
- Redis running locally
- Anthropic API key (or OpenAI)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your env vars
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Flow

1. Teacher fills Create Assignment form (question types, marks, due date, optional PDF)
2. Frontend POSTs to `/api/assignments` → job added to BullMQ queue
3. Worker picks up job → calls LLM with structured prompt
4. LLM response parsed into structured JSON (sections, questions, difficulty, marks)
5. Result stored in MongoDB
6. WebSocket notifies frontend → user sees generated paper in real-time
7. Teacher can download as PDF

## Project Structure

```
vedaai/
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # App router pages
│       ├── components/# UI + domain components
│       ├── store/     # Zustand stores
│       ├── hooks/     # Custom hooks (useWebSocket, etc.)
│       └── types/     # Shared TypeScript types
└── backend/           # Express API
    └── src/
        ├── routes/    # API routes
        ├── controllers/
        ├── services/  # Business logic
        ├── models/    # Mongoose models
        ├── workers/   # BullMQ workers
        ├── queues/    # Queue setup
        └── websocket/ # WS server
```
