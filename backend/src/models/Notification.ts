import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'new_assignment'
  | 'assignment_graded'
  | 'submission_received'
  | 'new_announcement';

export interface NotificationDoc extends Document {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['new_assignment', 'assignment_graded', 'submission_received', 'new_announcement'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<NotificationDoc>('Notification', NotificationSchema);