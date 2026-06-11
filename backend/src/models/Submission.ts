import mongoose, { Schema, Document } from 'mongoose';

export interface SubmissionDoc extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: string;
  studentName: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  status: 'submitted' | 'under_review' | 'graded';
  grade?: number;
  maxGrade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'graded'],
      default: 'submitted',
    },
    grade: Number,
    maxGrade: Number,
    feedback: String,
    gradedBy: String,
    gradedAt: Date,
  },
  { timestamps: true }
);

// One submission per student per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const SubmissionModel = mongoose.model<SubmissionDoc>('Submission', SubmissionSchema);