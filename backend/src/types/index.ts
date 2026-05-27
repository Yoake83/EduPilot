export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  filePath?: string; // uploaded file path
}

export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answerKey?: string;
}

export interface Section {
  title: string; // e.g. "Section A"
  instruction: string; // e.g. "Attempt all questions. Each question carries 2 marks"
  questions: Question[];
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  totalMarks: number;
  sections: Section[];
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  result?: GeneratedPaper;
  createdAt: string;
  updatedAt: string;
}

export interface JobStatus {
  jobId: string;
  assignmentId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export type WSMessage =
  | { type: 'job:progress'; payload: { assignmentId: string; progress: number } }
  | { type: 'job:completed'; payload: { assignmentId: string; result: GeneratedPaper } }
  | { type: 'job:failed'; payload: { assignmentId: string; error: string } };
