'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
  questionPaper?: QuestionPaper;
}

interface QuestionPaper {
  school: string;
  location: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: Section[];
}

interface Section {
  title: string;
  instruction: string;
  marksPerQuestion: number;
  questions: Question[];
}

interface Question {
  id: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  text: string;
  marks: number;
}

// ── Sample generated paper ───────────────────────────────────────────────────

const SAMPLE_PAPER: QuestionPaper = {
  school: 'Delhi Public School, Sector-4, Bokaro',
  location: 'Bokaro Steel City',
  subject: 'English',
  className: '5th',
  timeAllowed: '45 minutes',
  maxMarks: 20,
  sections: [
    {
      title: 'Section A',
      instruction: 'Short Answer Questions\nAttempt all questions. Each question carries 2 marks',
      marksPerQuestion: 2,
      questions: [
        { id: 1, difficulty: 'Easy', text: 'Define electroplating. Explain its purpose.', marks: 2 },
        { id: 2, difficulty: 'Moderate', text: 'What is the role of a conductor in the process of electrolysis?', marks: 2 },
        { id: 3, difficulty: 'Easy', text: 'Why does a solution of copper sulfate conduct electricity?', marks: 2 },
        { id: 4, difficulty: 'Moderate', text: 'Describe one example of the chemical effect of electric current in daily life.', marks: 2 },
        { id: 5, difficulty: 'Moderate', text: 'Explain why electric current is said to have chemical effects.', marks: 2 },
        { id: 6, difficulty: 'Challenging', text: 'How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.', marks: 2 },
        { id: 7, difficulty: 'Challenging', text: 'What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.', marks: 2 },
        { id: 8, difficulty: 'Easy', text: 'Mention the type of current used in electroplating and justify why it is used.', marks: 2 },
        { id: 9, difficulty: 'Moderate', text: 'What is the importance of electric current in the field of metallurgy?', marks: 2 },
        { id: 10, difficulty: 'Challenging', text: 'Explain with a chemical equation how copper is deposited during the electroplating of an object.', marks: 2 },
      ],
    },
  ],
};

const SAMPLE_ANSWER_KEY = [
  'Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.',
  'A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.',
  'Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.',
  'An example is the electroplating of silver on jewelry to prevent tarnishing.',
  'Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects.',
];

// ── Difficulty badge ─────────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: Question['difficulty'] }) {
  const colors: Record<Question['difficulty'], string> = {
    Easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Moderate: 'bg-amber-50 text-amber-700 border border-amber-200',
    Challenging: 'bg-red-50 text-red-700 border border-red-200',
  };
  return (
    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors[level]}`}>
      {level}
    </span>
  );
}

// ── Question Paper renderer ───────────────────────────────────────────────────

function QuestionPaperView({ paper }: { paper: QuestionPaper }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm text-sm">
      {/* Header */}
      <div className="text-center px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-base">{paper.school}</h2>
        <p className="text-gray-500 text-xs mt-0.5">Subject: {paper.subject}</p>
        <p className="text-gray-500 text-xs">Class: {paper.className}</p>
      </div>

      {/* Meta row */}
      <div className="flex justify-between px-6 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
        <span>Time Allowed: <strong>{paper.timeAllowed}</strong></span>
        <span>Maximum Marks: <strong>{paper.maxMarks}</strong></span>
      </div>

      {/* Fields */}
      <div className="px-6 py-3 border-b border-gray-100 text-xs text-gray-600 space-y-1">
        <p className="text-gray-400 text-[11px]">All questions are compulsory unless stated otherwise.</p>
        <div className="flex gap-6 mt-1">
          <span>Name: <span className="border-b border-gray-400 inline-block w-28">&nbsp;</span></span>
          <span>Roll Number: <span className="border-b border-gray-400 inline-block w-20">&nbsp;</span></span>
        </div>
        <div>
          <span>Class: {paper.className} Section: <span className="border-b border-gray-400 inline-block w-16">&nbsp;</span></span>
        </div>
      </div>

      {/* Sections */}
      {paper.sections.map((section, si) => (
        <div key={si} className="px-6 py-4">
          <h3 className="font-bold text-gray-900 text-center mb-2">{section.title}</h3>
          <p className="text-xs text-gray-500 mb-3 whitespace-pre-line">{section.instruction}</p>
          <ol className="space-y-2.5">
            {section.questions.map((q) => (
              <li key={q.id} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="shrink-0 font-medium text-gray-500 w-5">{q.id}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <DifficultyBadge level={q.difficulty} />
                    <span className="text-gray-400 text-[10px]">[{q.marks} Marks]</span>
                  </div>
                  <span>{q.text}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-center text-xs font-semibold text-gray-600 mt-5 pt-3 border-t border-dashed border-gray-200">
            End of Question Paper
          </p>
        </div>
      ))}

      {/* Answer Key */}
      <div className="px-6 pb-5">
        <h3 className="font-bold text-gray-900 text-sm mb-2">Answer Key:</h3>
        <ol className="space-y-1.5">
          {SAMPLE_ANSWER_KEY.map((ans, i) => (
            <li key={i} className="text-xs text-gray-600 flex gap-2">
              <span className="shrink-0 font-medium text-gray-400">{i + 1}.</span>
              <span>{ans}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ── Chat message ─────────────────────────────────────────────────────────────

function ChatMessage({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-gray-100 text-gray-800 text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* AI message bubble */}
      <div className="bg-[#1a1a1a] text-white text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
        <p>{message.content}</p>
        {message.questionPaper && (
          <button className="mt-2.5 flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/20">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M4.5 7L8 10.5 11.5 7M2 13h12" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download as PDF
          </button>
        )}
      </div>

      {/* Question paper card */}
      {message.questionPaper && <QuestionPaperView paper={message.questionPaper} />}
    </div>
  );
}

// ── Suggestion chips ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Generate a Math test for Grade 6',
  'Create a Science quiz on Photosynthesis',
  'Make a English grammar worksheet',
  'Generate a History test on World War II',
];

// ── Mobile top bar ────────────────────────────────────────────────────────────

function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
      <button onClick={onMenuOpen} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="#374151" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 34 34" fill="none">
          <defs>
            <linearGradient id="vg-mob" x1="3" y1="1" x2="31" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFB347"/>
              <stop offset="45%" stopColor="#E8620A"/>
              <stop offset="100%" stopColor="#B8001A"/>
            </linearGradient>
          </defs>
          <rect width="34" height="34" rx="8" fill="url(#vg-mob)"/>
          <path d="M9.5 11L17 25L24.5 11" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <span className="font-bold text-sm text-gray-900">VedaAI</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
        JD
      </div>
    </div>
  );
}

// ── Mobile sidebar drawer ─────────────────────────────────────────────────────

function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-50 md:hidden transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {children}
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = text ?? input.trim();
    if (!query || loading) return;

    setInput('');
    setLoading(true);

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);

    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1200));

    const aiMsg: Message = {
      role: 'assistant',
      content: `Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:`,
      questionPaper: SAMPLE_PAPER,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <MobileTopBar onMenuOpen={() => setDrawerOpen(true)} />
{/* Top Navbar */}
<div className="h-[72px] bg-white border-b border-[#ECECEC] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">

  {/* LEFT */}
  <div className="flex items-center gap-3">

    {/* Mobile Logo */}
    <div className="md:hidden flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold">
        V
      </div>

      <span className="text-[15px] font-semibold">
        VedaAI
      </span>
    </div>

    {/* Desktop Title */}
    <div className="hidden md:flex items-center gap-2 text-sm text-[#9CA3AF]">
      <span>AI Teacher's Toolkit</span>
    </div>
  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-3">

    {/* Bell */}
    <div className="relative">
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path
          d="M4.5 8.5C4.5 5.5 7.4 3 11 3C14.6 3 17.5 5.5 17.5 8.5V14L19 16H3L4.5 14V8.5Z"
          stroke="#555"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#FF5A1F]" />
    </div>

    {/* Desktop Profile */}
    <div
      className="
        hidden md:flex
        items-center
        gap-3
        bg-white
        border border-[#ECECEC]
        rounded-2xl
        px-2.5
        py-1.5
        shadow-sm
      "
    >
      <div
        className="
          w-8
          h-8
          rounded-full
          bg-[#E5E5E5]
          flex
          items-center
          justify-center
          text-[11px]
          font-semibold
          text-[#444]
        "
      >
        JD
      </div>

      <span className="text-[14px] font-medium text-[#2F2F2F]">
        John Doe
      </span>

      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 8L10 13L15 8"
          stroke="#8B8B8B"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>

    {/* Mobile Profile */}
    <button
      className="
        md:hidden
        w-9
        h-9
        rounded-full
        bg-[#E5E5E5]
        flex
        items-center
        justify-center
        text-[11px]
        font-semibold
        text-[#444]
        border border-[#ECECEC]
      "
    >
      JD
    </button>
  </div>
</div>
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">

            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
                  <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
                    <path d="M9.5 11L17 25L24.5 11" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1.5">AI Teacher's Toolkit</h1>
                <p className="text-sm text-gray-500 max-w-sm">
                  Generate custom question papers, quizzes, and worksheets for any class, subject, or topic instantly.
                </p>

                {/* Suggestion chips */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-xs bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-600 hover:text-orange-700 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1 bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask VedaAI to generate a question paper..."
                className="flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent leading-relaxed max-h-[120px] overflow-y-auto"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="shrink-0 w-8 h-8 rounded-xl bg-[#1a1a1a] disabled:bg-gray-200 flex items-center justify-center transition-colors hover:bg-gray-800 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 13V3M4 7l4-4 4 4" stroke={input.trim() ? 'white' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              VedaAI can make mistakes. Please verify generated content before use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}