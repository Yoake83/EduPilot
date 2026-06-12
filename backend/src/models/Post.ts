import mongoose, { Schema, Document } from 'mongoose';

export interface Reply {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface PostDoc extends Document {
  groupId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  userRole: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: string[];
  replies: Reply[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const PostSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'student' },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    upvotes: [{ type: String }],
    replies: [ReplySchema],
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PostModel = mongoose.model<PostDoc>('Post', PostSchema);