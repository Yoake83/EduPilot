import { NotificationModel, type NotificationType } from '../models/Notification';
import { broadcastToUser } from '../websocket/server';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function sendNotification(params: SendNotificationParams) {
  try {
    const notification = await NotificationModel.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      read: false,
    });

    // Push via WebSocket if user is connected
    broadcastToUser(params.userId, {
      type: 'notification',
      payload: notification,
    });

    return notification;
  } catch (err) {
    console.error('[notification] send error:', err);
  }
}

export async function notifyGroupStudents(
  students: Array<{ userId: string; name: string }>,
  params: Omit<SendNotificationParams, 'userId'>
) {
  await Promise.all(
    students.map((s) => sendNotification({ ...params, userId: s.userId }))
  );
}