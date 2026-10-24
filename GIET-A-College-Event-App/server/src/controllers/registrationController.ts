import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Event, { EventStatus } from '../models/Event';
import Registration, { RegistrationStatus } from '../models/Registration';
import User, { UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../services/notificationService';
import { NotificationType } from '../models/Notification';

export const registerForEvent = async (req: Request, res: Response) => {
  const isReplicaSet = ['ReplicaSetWithPrimary', 'Sharded', 'LoadBalanced'].includes(
    ((mongoose.connection as any).getClient?.() || (mongoose.connection as any).client)?.topology?.description?.type
  );
  const session = isReplicaSet ? await mongoose.startSession() : null;
  if (session) {
    session.startTransaction();
  }

  try {
    const authReq = req as AuthRequest;
    const studentId = authReq.user?.id;
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId as string)) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, error: { message: 'Invalid event ID' } });
    }

    if (authReq.user?.role !== UserRole.STUDENT) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(403).json({ success: false, error: { message: 'Only students can register for events' } });
    }

    const eventQuery = Event.findById(eventId as string);
    if (session) eventQuery.session(session);
    const event = await eventQuery;

    if (!event) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }

    if (event.status !== EventStatus.PUBLISHED) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ success: false, error: { message: 'This event is not open for registration' } });
    }

    // Check duplicate
    const dupQuery = Registration.findOne({ student: studentId, event: eventId });
    if (session) dupQuery.session(session);
    const existingRegistration = await dupQuery;
    if (existingRegistration) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(409).json({ success: false, error: { message: 'You are already registered for this event' } });
    }

    // Check capacity
    if (event.capacity && event.capacity > 0) {
      const capQuery = Registration.countDocuments({ event: eventId, status: RegistrationStatus.REGISTERED });
      if (session) capQuery.session(session);
      const currentRegistrations = await capQuery;
      if (currentRegistrations >= event.capacity) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({ success: false, error: { message: 'This event is currently full' } });
      }
    }

    // Generate a secure random token for the QR Pass
    const crypto = require('crypto');
    const qrToken = crypto.randomBytes(32).toString('hex');

    // Fetch student profile details to store name/email/phone directly on the registration record
    const studentUser = await User.findById(studentId).select('name email rollNumber branch phone');

    // Create registration with student and event details stored directly
    const registration = new Registration({
      student: studentId,
      studentName: studentUser?.name || 'Student',
      studentEmail: studentUser?.email,
      studentRollNumber: studentUser?.rollNumber,
      studentBranch: studentUser?.branch,
      studentPhone: studentUser?.phone,
      event: eventId,
      eventTitle: event.title,
      eventCategory: event.category || '',
      eventDate: event.date,
      eventVenue: event.venue,
      eventTime: `${event.startTime} - ${event.endTime}`,
      status: RegistrationStatus.REGISTERED,
      qrToken,
    });

    if (session) {
      await registration.save({ session });
    } else {
      await registration.save();
    }
    
    // Create notification
    await createNotification({
      recipient: studentId as string,
      type: NotificationType.REGISTRATION_CONFIRMED,
      title: 'Registration Confirmed',
      message: `You have successfully registered for ${event.title}.`,
      event: eventId as string,
      registration: registration._id.toString(),
      session: session || undefined,
    });

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return res.status(201).json({ success: true, data: registration });
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    
    // Check for MongoDB duplicate key error code
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: { message: 'You are already registered for this event' } });
    }

    console.error('[RegistrationController] registerForEvent error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to register for event' } });
  }
};

export const getMyRegistrations = async (req: Request, res: Response) => {
  try {
    const studentId = (req as AuthRequest).user?.id;

    const registrations = await Registration.find({ student: studentId })
      .populate('event', 'title date startTime endTime venue poster status category')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    console.error('[RegistrationController] getMyRegistrations error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch registrations' } });
  }
};

export const getRegistrationDetails = async (req: Request, res: Response) => {
  try {
    const studentId = (req as AuthRequest).user?.id;
    const { registrationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(registrationId as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid registration ID' } });
    }

    const registration = await Registration.findOne({ _id: registrationId as string, student: studentId })
      .populate('event', '-createdBy -__v');

    if (!registration) {
      return res.status(404).json({ success: false, error: { message: 'Registration not found' } });
    }

    // Check if feedback exists
    const Feedback = mongoose.model('Feedback');
    const feedbackExists = await Feedback.exists({ registration: registration._id, student: studentId });

    return res.status(200).json({ 
      success: true, 
      data: {
        ...registration.toObject(),
        hasFeedback: !!feedbackExists
      }
    });
  } catch (error) {
    console.error('[RegistrationController] getRegistrationDetails error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch registration details' } });
  }
};

export const getRegistrationPass = async (req: Request, res: Response) => {
  try {
    const studentId = (req as AuthRequest).user?.id;
    const { registrationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(registrationId as string)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid registration ID' } });
    }

    const registration = await Registration.findOne({ _id: registrationId as string, student: studentId })
      .populate('event', 'title date startTime endTime venue status')
      .populate('student', 'name rollNumber course branch year semester');

    if (!registration) {
      return res.status(404).json({ success: false, error: { message: 'Registration not found' } });
    }

    if (registration.status !== RegistrationStatus.REGISTERED || (registration.event as any).status !== EventStatus.PUBLISHED) {
      return res.status(400).json({ success: false, error: { message: 'Pass is not available for this registration' } });
    }

    return res.status(200).json({
      success: true,
      data: {
        registration: {
          id: registration._id,
          event: registration.event,
          student: registration.student,
          status: registration.status,
        },
        pass: {
          token: registration.qrToken,
        }
      }
    });
  } catch (error) {
    console.error('[RegistrationController] getRegistrationPass error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch registration pass' } });
  }
};
