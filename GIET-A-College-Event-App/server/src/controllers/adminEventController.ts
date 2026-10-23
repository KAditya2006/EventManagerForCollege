import { Request, Response } from 'express';
import Event, { EventStatus } from '../models/Event';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import {
  createNotification,
  createNotificationsForEventUpdate,
  createNotificationsForEventCancellation,
  broadcastNewEventAnnouncement,
} from '../services/notificationService';
import { NotificationType } from '../models/Notification';

export const getAdminEvents = async (req: Request, res: Response) => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;

    let pageNum = parseInt(page as string, 10);
    let limitNum = parseInt(limit as string, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;
    if (limitNum > 100) limitNum = 100;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (status && typeof status === 'string' && Object.values(EventStatus).includes(status as EventStatus)) {
      query.status = status;
    }

    if (search && typeof search === 'string') {
      query.$text = { $search: search };
    }

    const sort = search ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

    const events = await Event.find(query)
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
    console.error('[AdminEventController] getAdminEvents error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch admin events' } });
  }
};

export const getAdminEventDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid event ID' } });
    }

    const event = await Event.findById(id as string);

    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }

    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('[AdminEventController] getAdminEventDetails error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch admin event details' } });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.id;
    const { title, description, date, startTime, endTime, venue, organizer, category, capacity, poster } = req.body;

    if (!title || !description || !date || !startTime || !endTime || !venue || !organizer) {
      return res.status(400).json({ success: false, error: { message: 'Missing required event fields' } });
    }

    const event = new Event({
      title,
      description,
      date,
      startTime,
      endTime,
      venue,
      organizer,
      category,
      capacity,
      poster,
      status: EventStatus.DRAFT,
      createdBy: adminId,
    });

    await event.save();

    return res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('[AdminEventController] createEvent error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to create event' } });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, venue, organizer, category, capacity, poster } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid event ID' } });
    }

    const event = await Event.findById(id as string);
    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (venue) event.venue = venue;
    if (organizer) event.organizer = organizer;
    if (category !== undefined) event.category = category;
    if (poster !== undefined) event.poster = poster;

    if (capacity !== undefined) {
      // Basic capacity check: Don't reduce below existing registrations if possible
      // In Phase 6, we keep it simple or check DB. Let's do a quick check against Registration count.
      const Registration = mongoose.model('Registration');
      const regCount = await Registration.countDocuments({ event: id, status: 'REGISTERED' });
      if (capacity < regCount) {
        return res.status(400).json({ success: false, error: { message: `Cannot reduce capacity below existing registrations (${regCount})` } });
      }
      event.capacity = capacity;
    }

    await event.save();

    if (event.status === EventStatus.PUBLISHED) {
      await createNotificationsForEventUpdate(event._id.toString(), event.title);
    }

    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('[AdminEventController] updateEvent error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update event' } });
  }
};

export const updateEventStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid event ID' } });
    }

    if (!Object.values(EventStatus).includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status provided' } });
    }

    const event = await Event.findById(id as string);
    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }

    // Publish validation
    if (status === EventStatus.PUBLISHED) {
      if (!event.title || !event.description || !event.date || !event.startTime || !event.endTime || !event.venue) {
        return res.status(400).json({ success: false, error: { message: 'Cannot publish event: missing required fields' } });
      }
      
      // Basic logic: start time < end time (simple string compare for HH:MM if format is standard, but we skip complex string parsing and rely on valid input for now. capacity > 0)
      if (event.capacity !== undefined && event.capacity <= 0) {
        return res.status(400).json({ success: false, error: { message: 'Cannot publish event: capacity must be greater than 0' } });
      }
    }

    const previousStatus = event.status;
    event.status = status;
    await event.save();

    if (status === EventStatus.PUBLISHED && previousStatus !== EventStatus.PUBLISHED) {
      broadcastNewEventAnnouncement(event._id.toString()).catch((e) =>
        console.warn('[AdminEventController] Broadcast new event announcement error:', e.message)
      );
    }

    if (status === EventStatus.CANCELLED && previousStatus === EventStatus.PUBLISHED) {
      await createNotificationsForEventCancellation(event._id.toString(), event.title);
    }

    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('[AdminEventController] updateEventStatus error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update event status' } });
  }
};

export const checkInStudent = async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.id;
    const { eventId } = req.params;
    const { qrToken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid event ID' } });
    }

    if (!qrToken || typeof qrToken !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'Invalid QR token provided' } });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }

    if (event.status !== EventStatus.PUBLISHED) {
      return res.status(400).json({ success: false, error: { message: 'Cannot check in. Event is not currently published.' } });
    }

    const Registration = mongoose.model('Registration');
    
    // Find the registration strictly by qrToken
    const registration = await Registration.findOne({ qrToken }).populate('student', 'name email branch year');

    if (!registration) {
      return res.status(400).json({ success: false, error: { message: 'Invalid QR code. Registration not found.' } });
    }

    // Cross-event protection: Ensure the QR matches the event context the admin is in
    if (registration.event.toString() !== eventId) {
      return res.status(400).json({ success: false, error: { message: 'QR belongs to another event.' } });
    }

    if (registration.status !== 'REGISTERED') {
      return res.status(400).json({ success: false, error: { message: 'Registration is not active (cancelled or invalid).' } });
    }

    if (registration.checkedIn) {
      return res.status(200).json({ 
        success: false, 
        alreadyCheckedIn: true,
        data: {
          student: registration.student,
          checkedInAt: registration.checkedInAt
        },
        error: { message: 'Already checked in.' }
      });
    }

    // Atomic update to mark attendance safely against concurrent scans
    const updatedRegistration = await Registration.findOneAndUpdate(
      { _id: registration._id, checkedIn: false },
      { 
        checkedIn: true, 
        checkedInAt: new Date(), 
        checkedInBy: adminId 
      },
      { new: true }
    ).populate('student', 'name email branch year');

    if (!updatedRegistration) {
      // If it became null, another request beat us to the update
      return res.status(200).json({ 
        success: false, 
        alreadyCheckedIn: true,
        data: {
          student: registration.student,
          checkedInAt: registration.checkedInAt
        },
        error: { message: 'Already checked in.' }
      });
    }

    const studentId = (updatedRegistration.student as any)?._id || updatedRegistration.student;

    await createNotification({
      recipient: studentId.toString(),
      type: NotificationType.ATTENDANCE_CONFIRMED,
      title: 'Attendance Confirmed',
      message: `Your attendance for ${event.title} has been recorded.`,
      event: event._id.toString(),
      registration: updatedRegistration._id.toString(),
    });

    return res.status(200).json({ 
      success: true, 
      data: {
        student: updatedRegistration.student,
        checkedInAt: updatedRegistration.checkedInAt,
        checkedIn: true
      }
    });

  } catch (error) {
    console.error('[AdminEventController] checkInStudent error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to process check-in.' } });
  }
};
