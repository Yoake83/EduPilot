import mongoose, { Schema, Document } from 'mongoose';

export type QuizQuestionType = 'mcq' | 'true_false' | 'fill_blank';

export interface MCQOption {
  label: string; // A, B, C, D
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  text: string;
  options?: MCQOption[]; // only for MCQ
  answer: string;
  explanation?: string;
  marks: number;
}

export interface QuizDoc extends Document {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  questionTypes: QuizQuestionType[];
  totalQuestions: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  questions?: QuizQuestion[];
  fileContent?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MCQOptionSchema = new Schema({ label: String, text: String }, { _id: false });

const QuizQuestionSchema = new Schema(
  {
    id: String,
    type: { type: String, enum: ['mcq', 'true_false', 'fill_blank'] },
    text: String,
    options: [MCQOptionSchema],
    answer: String,
    explanation: String,
    marks: Number,
  },
  { _id: false }
);

const QuizSchema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    topic: { type: String, required: true },
    questionTypes: [{ type: String, enum: ['mcq', 'true_false', 'fill_blank'] }],
    totalQuestions: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: String,
    questions: [QuizQuestionSchema],
    fileContent: String,
    createdBy: String,
  },
  { timestamps: true }
);

export const QuizModel = mongoose.model<QuizDoc>('Quiz', QuizSchema);