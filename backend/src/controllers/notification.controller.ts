import type { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';

export async function getNotifications(req: Request, res: Response) {
  try {
    const notifications = await NotificationModel.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await NotificationModel.countDocuments({
      userId: req.user!.userId,
      read: false,
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await NotificationModel.updateMany({ userId: req.user!.userId }, { read: true });
    } else {
      await NotificationModel.findByIdAndUpdate(id, { read: true });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
}

export async function deleteNotification(req: Request, res: Response) {
  try {
    await NotificationModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
}