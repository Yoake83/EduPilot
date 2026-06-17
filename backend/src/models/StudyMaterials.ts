import mongoose, { Schema, Document } from 'mongoose';

export interface Chunk {
  text: string;
  index: number;
}

export interface StudyMaterialDoc extends Document {
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  uploaderName: string;
  uploaderRole: string;
  groupId?: string; // if teacher uploads for a group
  subject?: string;
  chunks: Chunk[];
  totalChunks: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChunkSchema = new Schema({ text: String, index: Number }, { _id: false });

const StudyMaterialSchema = new Schema(
  {
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: String, required: true, index: true },
    uploaderName: { type: String, required: true },
    uploaderRole: { type: String, required: true },
    groupId: { type: String, index: true },
    subject: { type: String },
    chunks: [ChunkSchema],
    totalChunks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const StudyMaterialModel = mongoose.model<StudyMaterialDoc>(
  'StudyMaterial',
  StudyMaterialSchema
);