import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const studentId = (req as AuthRequest).user?.id;
    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 20;
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: studentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ recipient: studentId });

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[NotificationController] getMyNotifications error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch notifications' } });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const studentId = (req as AuthRequest).user?.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid notification ID' } });
    }

    const notification = await Notification.findOne({ _id: id, recipient: studentId });

    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }

    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('[NotificationController] markNotificationAsRead error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to mark notification as read' } });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const studentId = (req as AuthRequest).user?.id;
    const count = await Notification.countDocuments({ recipient: studentId, read: false });
    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error('[NotificationController] getUnreadCount error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch unread count' } });
  }
};
