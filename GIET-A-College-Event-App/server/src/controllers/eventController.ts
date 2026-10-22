import { Request, Response } from 'express';
import Event, { EventStatus } from '../models/Event';
import mongoose from 'mongoose';

export const getPublishedEvents = async (req: Request, res: Response) => {
  try {
    const { search, category, status, page = '1', limit = '10' } = req.query;

    let pageNum = parseInt(page as string, 10);
    let limitNum = parseInt(limit as string, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;
    if (limitNum > 100) limitNum = 100; // max limit
    const skip = (pageNum - 1) * limitNum;

    // Students can only see PUBLISHED or CANCELLED (if requested) events. Never DRAFT.
    const allowedStatuses = [EventStatus.PUBLISHED, EventStatus.CANCELLED];
    let queryStatus = { $in: allowedStatuses } as any;

    // If client specifically requests CANCELLED or PUBLISHED, filter it, but strictly within allowed bounds
    if (status && typeof status === 'string') {
      if (allowedStatuses.includes(status as EventStatus)) {
        queryStatus = status;
      }
    }

    const query: any = {
      status: queryStatus,
    };

    if (category && typeof category === 'string') {
      query.category = category;
    }

    if (search && typeof search === 'string') {
      // Use text index search
      query.$text = { $search: search };
    }

    // Sort: if text search, sort by relevance, else sort by date (upcoming first)
    const sort = search ? { score: { $meta: 'textScore' } } : { date: 1 };

    const events = await Event.find(query)
      .select('-__v -createdBy') // Don't expose internal creator ID
      .sort(sort as any)
      .skip(skip)
      .limit(limitNum);

    const total = await Event.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: events,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[EventController] getPublishedEvents error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch events' } });
  }
};

export const getEventDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid event ID' } });
    }

    const event = await Event.findById(id as string).select('-__v -createdBy');

    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }

    // Ensure students cannot access DRAFT events
    if (event.status === EventStatus.DRAFT) {
      return res.status(403).json({ success: false, error: { message: 'Access denied to this event' } });
    }

    let isRegistered = false;
    const authReq = req as any; // Simple cast to access user
    if (authReq.user && authReq.user.role === 'STUDENT') {
      const Registration = mongoose.model('Registration');
      const reg = await Registration.findOne({ event: id as string, student: authReq.user.id });
      if (reg) {
        isRegistered = true;
      }
    }

    return res.status(200).json({ success: true, data: { ...event.toObject(), isRegistered } });
  } catch (error) {
    console.error('[EventController] getEventDetails error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch event details' } });
  }
};
