import Groq from 'groq-sdk';
import fs from 'fs/promises';
import path from 'path';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface Question {
  id: string;
  text: string;
  marks: number;
  answerKey?: string;
}

interface Section {
  title: string;
  questions: Question[];
}

interface EvaluationResult {
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  feedback: string;
  suggestions: string;
  questionResults: Array<{
    questionId: string;
    questionText: string;
    marksAwarded: number;
    maxMarks: number;
    feedback: string;
  }>;
}

function buildEvaluationPrompt(
  sections: Section[],
  studentAnswerText: string
): string {
  const questionsBlock = sections.flatMap(sec =>
    sec.questions.map(q => ({
      id: q.id,
      text: q.text,
      marks: q.marks,
      answerKey: q.answerKey || 'No answer key provided — use your judgment',
    }))
  );

  const maxMarks = questionsBlock.reduce((s, q) => s + q.marks, 0);

  return `You are an expert teacher evaluating a student's answer sheet.

QUESTIONS AND ANSWER KEYS:
${JSON.stringify(questionsBlock, null, 2)}

STUDENT'S SUBMITTED ANSWER TEXT:
"""
${studentAnswerText.slice(0, 5000)}
"""

Your task:
1. Match the student's answers to each question as best as possible
2. Award marks based on correctness and the answer key
3. Be fair — award partial marks where the student shows understanding
4. Provide brief, constructive feedback per question
5. Give overall feedback and suggestions for improvement

Respond with ONLY valid JSON:
{
  "totalMarksAwarded": <number>,
  "maxMarks": ${maxMarks},
  "overallFeedback": "<2-3 sentence overall assessment>",
  "suggestions": "<2-3 specific improvement suggestions>",
  "questionResults": [
    {
      "questionId": "<id>",
      "questionText": "<question text>",
      "marksAwarded": <number>,
      "maxMarks": <number>,
      "feedback": "<brief feedback for this question>"
    }
  ]
}`;
}

export async function evaluateSubmission(
  submissionFilePath: string,
  sections: Section[]
): Promise<EvaluationResult> {
  // Extract text from student's uploaded file
  let studentAnswerText = '';
  
  try {
    const ext = path.extname(submissionFilePath).toLowerCase();
    
    if (ext === '.pdf' || ext === '') {
      // Try PDF parsing
      const pdfParse = (await import('pdf-parse')).default;
      const buffer = await fs.readFile(submissionFilePath);
      const pdfData = await pdfParse(buffer);
      studentAnswerText = pdfData.text;
    } else {
      // For other file types, read as text
      studentAnswerText = await fs.readFile(submissionFilePath, 'utf-8').catch(() => '');
    }
  } catch (err) {
    console.error('[evaluator] file read error:', err);
    studentAnswerText = 'Could not extract text from file';
  }

  if (!studentAnswerText.trim()) {
    studentAnswerText = 'No readable text found in submission — file may be image-based or handwritten';
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert teacher. Evaluate student answers fairly and return valid JSON only.',
      },
      {
        role: 'user',
        content: buildEvaluationPrompt(sections, studentAnswerText),
      },
    ],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content || '{}';
  const parsed = JSON.parse(raw);

  const maxMarks = sections.flatMap(s => s.questions).reduce((sum, q) => sum + q.marks, 0);
  const totalAwarded = Number(parsed.totalMarksAwarded) || 0;

  return {
    totalMarks: totalAwarded,
    maxMarks,
    percentage: maxMarks > 0 ? Math.round((totalAwarded / maxMarks) * 100) : 0,
    feedback: parsed.overallFeedback || 'No feedback provided',
    suggestions: parsed.suggestions || '',
    questionResults: parsed.questionResults || [],
  };
}