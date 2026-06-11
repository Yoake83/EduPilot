import mongoose, { Schema, Document } from 'mongoose';

export interface GroupDoc extends Document {
  name: string;
  subject: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  joinCode: string;
  students: Array<{ userId: string; name: string; email: string; joinedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String },
    teacherId: { type: String, required: true },
    teacherName: { type: String, required: true },
    joinCode: { type: String, required: true, unique: true, uppercase: true },
    students: [StudentSchema],
  },
  { timestamps: true }
);

GroupSchema.index({ teacherId: 1 });
GroupSchema.index({ 'students.userId': 1 });

export const GroupModel = mongoose.model<GroupDoc>('Group', GroupSchema);