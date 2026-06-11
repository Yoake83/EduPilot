import Groq from 'groq-sdk';
import type { QuizJobData } from '../queues/quiz.queue';
import type { QuizQuestion, QuizQuestionType } from '../models/Quiz';
import { v4 as uuid } from 'uuid';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildQuizPrompt(data: QuizJobData): string {
  const typeBreakdown = distributeQuestions(data.questionTypes, data.totalQuestions);

  const fileSection = data.fileContent
    ? `\nSOURCE MATERIAL (generate questions strictly from this content):\n"""\n${data.fileContent.slice(0, 6000)}\n"""\n`
    : '';

  const typeDescriptions = typeBreakdown
    .map(({ type, count }) => {
      if (type === 'mcq') return `- ${count} Multiple Choice Questions (4 options each, one correct)`;
      if (type === 'true_false') return `- ${count} True/False Questions`;
      if (type === 'fill_blank') return `- ${count} Fill in the Blank Questions`;
    })
    .join('\n');

  return `You are an expert teacher creating a quiz.

Quiz details:
- Title: ${data.title}
- Subject: ${data.subject}
- Grade: ${data.grade}
- Topic: ${data.topic}
${fileSection}
Generate exactly:
${typeDescriptions}

Total: ${data.totalQuestions} questions

You MUST respond with ONLY valid JSON. No markdown, no explanation:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "text": "question text",
      "options": [
        { "label": "A", "text": "option text" },
        { "label": "B", "text": "option text" },
        { "label": "C", "text": "option text" },
        { "label": "D", "text": "option text" }
      ],
      "answer": "A",
      "explanation": "brief explanation",
      "marks": 1
    },
    {
      "id": "q2",
      "type": "true_false",
      "text": "statement to evaluate",
      "answer": "True",
      "explanation": "brief explanation",
      "marks": 1
    },
    {
      "id": "q3",
      "type": "fill_blank",
      "text": "The capital of France is ___.",
      "answer": "Paris",
      "explanation": "brief explanation",
      "marks": 1
    }
  ]
}`;
}

function distributeQuestions(
  types: QuizQuestionType[],
  total: number
): { type: QuizQuestionType; count: number }[] {
  const perType = Math.floor(total / types.length);
  const remainder = total % types.length;
  return types.map((type, i) => ({
    type,
    count: perType + (i === 0 ? remainder : 0),
  }));
}

function parseQuizResponse(raw: string): QuizQuestion[] {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid quiz structure: missing questions array');
  }

  return parsed.questions.map((q: any): QuizQuestion => ({
    id: q.id || uuid(),
    type: q.type,
    text: String(q.text),
    options: q.options || undefined,
    answer: String(q.answer),
    explanation: q.explanation ? String(q.explanation) : undefined,
    marks: Number(q.marks) || 1,
  }));
}

export async function generateQuiz(data: QuizJobData): Promise<QuizQuestion[]> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert teacher. Always respond with valid JSON only. No markdown, no explanation.',
      },
      {
        role: 'user',
        content: buildQuizPrompt(data),
      },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content || '';
  console.log('[quiz] Groq response (first 200):', raw.substring(0, 200));
  return parseQuizResponse(raw);
}