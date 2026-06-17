import Groq from 'groq-sdk';
import type { GeneratedPaper, Section, Question, Difficulty } from '../types';
import type { GenerationJobData } from '../queues/generation.queue';
import { v4 as uuid } from 'uuid';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildPrompt(data: GenerationJobData): string {
  const qtList = data.questionTypes
    .map((qt) => `- ${qt.type}: ${qt.count} questions, ${qt.marks} marks each`)
    .join('\n');

  const totalMarks = data.questionTypes.reduce((s, qt) => s + qt.count * qt.marks, 0);
  const totalQuestions = data.questionTypes.reduce((s, qt) => s + qt.count, 0);

  const fileSection = data.fileContent
    ? `\nSOURCE MATERIAL (generate questions strictly based on this content):\n"""\n${data.fileContent.slice(0, 6000)}\n"""\n`
    : '';

  return `You are an expert teacher creating an exam question paper.

Create a structured question paper for:
- Subject: ${data.subject}
- Grade/Class: ${data.grade}
- Title: ${data.title}
${data.additionalInstructions ? `- Special instructions: ${data.additionalInstructions}` : ''}
${fileSection}
Question types required:
${qtList}

Total: ${totalQuestions} questions, ${totalMarks} marks

Rules:
1. Group questions into sections (Section A = easy/short, Section B = medium, Section C = hard/long)
2. Assign difficulty: easy/moderate/hard to each question
3. Include a short answer key for each question
4. Questions must be appropriate for grade ${data.grade}
5. Each section must have a clear instruction line
${data.fileContent ? '6. Questions MUST be based on the source material provided above.' : ''}

You MUST respond with ONLY valid JSON. No markdown, no code fences, no explanation:
{
  "subject": "${data.subject}",
  "grade": "${data.grade}",
  "title": "${data.title}",
  "timeAllowed": "1 hour 30 minutes",
  "totalMarks": ${totalMarks},
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries 2 marks.",
      "questions": [
        {
          "id": "q1",
          "text": "question text here",
          "difficulty": "easy",
          "marks": 2,
          "answerKey": "concise answer here"
        }
      ]
    }
  ]
}`;
}

function parseLLMResponse(raw: string): GeneratedPaper {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid paper structure: missing sections');
  }

  const sections: Section[] = parsed.sections.map((sec: any) => ({
    title: String(sec.title || 'Section'),
    instruction: String(sec.instruction || 'Attempt all questions.'),
    questions: (sec.questions || []).map((q: any): Question => {
      const difficulty: Difficulty = ['easy', 'moderate', 'hard'].includes(q.difficulty)
        ? q.difficulty
        : 'moderate';
      return {
        id: q.id || uuid(),
        text: String(q.text),
        difficulty,
        marks: Number(q.marks) || 1,
        answerKey: q.answerKey ? String(q.answerKey) : undefined,
      };
    }),
  }));

  return {
    // No school name — use title instead
    schoolName: parsed.title || parsed.subject || 'Assignment',
    subject: String(parsed.subject),
    grade: String(parsed.grade),
    timeAllowed: String(parsed.timeAllowed || '1 hour'),
    totalMarks: Number(parsed.totalMarks),
    sections,
  };
}

export async function generatePaper(data: GenerationJobData): Promise<GeneratedPaper> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert teacher. Always respond with valid JSON only. No markdown, no explanation.',
      },
      {
        role: 'user',
        content: buildPrompt(data),
      },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content || '';
  console.log('Groq raw response (first 200):', raw.substring(0, 200));
  return parseLLMResponse(raw);
}