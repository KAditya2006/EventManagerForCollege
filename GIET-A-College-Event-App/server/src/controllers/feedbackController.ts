import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import Event from '../models/Event';
import Registration from '../models/Registration';
import Feedback from '../models/Feedback';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const studentId = authReq.user?.id;
    
    if (authReq.user?.role !== UserRole.STUDENT) {
      return res.status(403).json({ success: false, error: { message: 'Only students can submit feedback' } });
    }

    const { eventId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid event ID' } });
    }

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: { message: 'Rating must be an integer between 1 and 5' } });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }

    const registration: any = await Registration.findOne({
      event: eventId as any,
      student: studentId as any,
      status: 'REGISTERED' as any
    });

    if (!registration) {
      return res.status(403).json({ success: false, error: { message: 'You do not have a valid registration for this event' } });
    }

    if (!registration.checkedIn) {
      return res.status(403).json({ success: false, error: { message: 'You must attend the event before submitting feedback' } });
    }

    const existingFeedback = await Feedback.findOne({ event: eventId as any, student: studentId as any });
    if (existingFeedback) {
      return res.status(409).json({ success: false, error: { message: 'You have already submitted feedback for this event' } });
    }

    let parsedComment = '';
    if (comment && typeof comment === 'string') {
      parsedComment = comment.trim();
    }

    const feedback = new Feedback({
      event: eventId,
      student: studentId,
      registration: registration._id,
      rating,
      comment: parsedComment || undefined
    });

    await feedback.save();

    return res.status(201).json({ success: true, data: feedback });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: { message: 'You have already submitted feedback for this event' } });
    }
    console.error('[FeedbackController] submitFeedback error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to submit feedback' } });
  }
};

export const getEventFeedback = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(eventId as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid event ID' } });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }

    let pageNum = parseInt(page as string, 10);
    let limitNum = parseInt(limit as string, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;
    if (limitNum > 100) limitNum = 100;
    const skip = (pageNum - 1) * limitNum;

    const feedbacks = await Feedback.find({ event: eventId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Feedback.countDocuments({ event: eventId });

    // Calculate average rating
    const aggregateResult = await Feedback.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId as string) } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    const averageRating = aggregateResult.length > 0 ? parseFloat(aggregateResult[0].averageRating.toFixed(1)) : 0;

    return res.status(200).json({ 
      success: true, 
      data: {
        feedbacks,
        stats: {
          averageRating,
          totalFeedback: total
        }
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('[FeedbackController] getEventFeedback error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch feedback' } });
  }
};
