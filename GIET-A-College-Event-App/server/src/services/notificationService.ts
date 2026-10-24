import mongoose, { ClientSession } from 'mongoose';
import Notification, { NotificationType } from '../models/Notification';
import Registration, { RegistrationStatus } from '../models/Registration';
import Event, { EventStatus } from '../models/Event';
import User, { UserRole } from '../models/User';
import {
  sendRegistrationEmail,
  sendNewEventAnnouncement,
  sendEventUpdateEmail,
  sendEventCancellationEmail,
  sendAttendanceConfirmedEmail,
} from '../utils/email';

interface CreateNotificationParams {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  event?: string;
  registration?: string;
  session?: ClientSession;
}

/**
 * Dispatches an institutional email for an in-app notification asynchronously.
 * Runs in the background without blocking the database or HTTP response.
 */
const dispatchEmailForNotification = async (params: CreateNotificationParams): Promise<void> => {
  try {
    const user = await User.findById(params.recipient).select('email name rollNumber');
    if (!user || !user.email) return;

    if (params.type === NotificationType.REGISTRATION_CONFIRMED) {
      const event = params.event ? await Event.findById(params.event) : null;
      const reg = params.registration ? await Registration.findById(params.registration) : null;

      if (event) {
        const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        await sendRegistrationEmail(user.email, {
          eventTitle: event.title,
          date: formattedDate,
          time: `${event.startTime} - ${event.endTime}`,
          venue: event.venue,
          organizer: event.organizer,
          category: event.category,
          qrToken: reg?.qrToken,
          studentName: user.name,
          rollNumber: user.rollNumber,
        });
      }
    } else if (params.type === NotificationType.ATTENDANCE_CONFIRMED) {
      const event = params.event ? await Event.findById(params.event) : null;
      await sendAttendanceConfirmedEmail(user.email, event?.title || params.title, user.name);
    } else if (params.type === NotificationType.EVENT_UPDATED) {
      const event = params.event ? await Event.findById(params.event) : null;
      await sendEventUpdateEmail(user.email, event?.title || 'Event', params.message);
    } else if (params.type === NotificationType.EVENT_CANCELLED) {
      const event = params.event ? await Event.findById(params.event) : null;
      await sendEventCancellationEmail(user.email, event?.title || 'Event', params.message);
    }
  } catch (err: any) {
    console.warn(`[NotificationService] Failed to dispatch email for notification ${params.type}:`, err.message);
  }
};

export const createNotification = async (params: CreateNotificationParams) => {
  const notification = new Notification({
    recipient: params.recipient,
    type: params.type,
    title: params.title,
    message: params.message,
    event: params.event,
    registration: params.registration,
  });

  if (params.session) {
    await notification.save({ session: params.session });
  } else {
    await notification.save();
  }

  // Asynchronously trigger institutional email notification
  dispatchEmailForNotification(params).catch((err) => {
    console.warn('[NotificationService] Background email dispatch error:', err.message);
  });

  return notification;
};

export const createNotificationsForEventUpdate = async (eventId: string, eventTitle: string, session?: ClientSession) => {
  // Find all active registrations for this event
  const registrations = await Registration.find({ event: eventId, status: RegistrationStatus.REGISTERED })
    .populate('student', 'email name')
    .session(session || null);

  if (registrations.length === 0) return;

  const notifications = registrations.map((reg) => ({
    recipient: reg.student,
    type: NotificationType.EVENT_UPDATED,
    title: 'Event Updated',
    message: `The event "${eventTitle}" has been updated. Please check the details.`,
    event: eventId,
    registration: reg._id,
  }));

  await Notification.insertMany(notifications, { session: session || null });

  // Dispath email updates to all registered attendees
  for (const reg of registrations) {
    const student = reg.student as any;
    if (student?.email) {
      sendEventUpdateEmail(student.email, eventTitle, `The event "${eventTitle}" has been updated. Please check the mobile app for updated schedule or venue.`)
        .catch((err) => console.warn(`[NotificationService] Update email failed for ${student.email}:`, err.message));
    }
  }
};

export const createNotificationsForEventCancellation = async (eventId: string, eventTitle: string, session?: ClientSession) => {
  // Find all active registrations for this event
  const registrations = await Registration.find({ event: eventId, status: RegistrationStatus.REGISTERED })
    .populate('student', 'email name')
    .session(session || null);

  if (registrations.length === 0) return;

  const notifications = registrations.map((reg) => ({
    recipient: reg.student,
    type: NotificationType.EVENT_CANCELLED,
    title: 'Event Cancelled',
    message: `The event "${eventTitle}" has been cancelled by the organizers.`,
    event: eventId,
    registration: reg._id,
  }));

  await Notification.insertMany(notifications, { session: session || null });

  // Dispatch cancellation emails to all registered attendees
  for (const reg of registrations) {
    const student = reg.student as any;
    if (student?.email) {
      sendEventCancellationEmail(student.email, eventTitle, `The event "${eventTitle}" has been cancelled by the college event committee. We apologize for the inconvenience.`)
        .catch((err) => console.warn(`[NotificationService] Cancellation email failed for ${student.email}:`, err.message));
    }
  }
};

export const createNotificationsForEventCompletion = async (eventId: string, eventTitle: string, session?: ClientSession) => {
  const registrations = await Registration.find({ event: eventId, status: RegistrationStatus.REGISTERED })
    .populate('student', 'email name')
    .session(session || null);

  if (registrations.length === 0) return;

  const notifications = registrations.map((reg) => ({
    recipient: reg.student,
    type: NotificationType.EVENT_COMPLETED,
    title: '🏁 Event Completed & Concluded',
    message: `The event "${eventTitle}" has concluded successfully! Prize distribution is complete. View the official winners in the app.`,
    event: eventId,
    registration: reg._id,
  }));

  await Notification.insertMany(notifications, { session: session || null });
};

/**
 * Broadcasts a new event announcement to all registered students on GIET(A) portal.
 * Creates both in-app notification records and dispatches announcement emails.
 */
export const broadcastNewEventAnnouncement = async (eventId: string): Promise<void> => {
  try {
    const event = await Event.findById(eventId);
    if (!event || event.status !== EventStatus.PUBLISHED) return;

    // Find all active students in the portal
    const students = await User.find({ role: UserRole.STUDENT }, 'email name').lean();
    if (!students || students.length === 0) return;

    const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const eventDetails = {
      title: event.title,
      description: event.description,
      date: formattedDate,
      time: `${event.startTime} - ${event.endTime}`,
      venue: event.venue,
      organizer: event.organizer,
      category: event.category,
      capacity: event.capacity,
    };

    // 1. In-App Notifications for all students
    const notifications = students.map((s) => ({
      recipient: s._id,
      type: NotificationType.EVENT_UPDATED,
      title: `New Event: ${event.title}`,
      message: `A new event "${event.title}" has been announced. Register now on the app!`,
      event: event._id,
    }));

    await Notification.insertMany(notifications).catch((err) => {
      console.warn('[NotificationService] In-app announcement notification error:', err.message);
    });

    // 2. Email Announcement to students
    const emailList = students.map((s) => s.email).filter(Boolean);
    if (emailList.length > 0) {
      await sendNewEventAnnouncement(emailList, eventDetails);
    }
  } catch (err: any) {
    console.warn('[NotificationService] broadcastNewEventAnnouncement error:', err.message);
  }
};
