import mongoose, { Schema, Document } from 'mongoose';
import type { GeneratedPaper, QuestionTypeConfig } from '../types';

export interface AssignmentDoc extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  filePath?: string;
  groupId?: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  result?: GeneratedPaper;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInstructions: { type: String },
    filePath: { type: String },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    result: { type: Schema.Types.Mixed },
    createdBy: { type: String, required: true, default: 'unknown' },
  },
  { timestamps: true }
);

AssignmentSchema.index({ groupId: 1 });
AssignmentSchema.index({ createdBy: 1 });

// Named export — keeps all existing imports working
export const AssignmentModel = mongoose.model<AssignmentDoc>('Assignment', AssignmentSchema);