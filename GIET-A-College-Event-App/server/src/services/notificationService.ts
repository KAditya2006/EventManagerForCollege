import mongoose, { ClientSession } from 'mongoose';
import Notification, { NotificationType } from '../models/Notification';
import Registration, { RegistrationStatus } from '../models/Registration';
import Event from '../models/Event';

interface CreateNotificationParams {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  event?: string;
  registration?: string;
  session?: ClientSession;
}

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
  return notification;
};

export const createNotificationsForEventUpdate = async (eventId: string, eventTitle: string, session?: ClientSession) => {
  // Find all active registrations for this event
  const registrations = await Registration.find({ event: eventId, status: RegistrationStatus.REGISTERED }).session(session || null);
  
  if (registrations.length === 0) return;

  const notifications = registrations.map(reg => ({
    recipient: reg.student,
    type: NotificationType.EVENT_UPDATED,
    title: 'Event Updated',
    message: `The event "${eventTitle}" has been updated. Please check the details.`,
    event: eventId,
    registration: reg._id,
  }));

  await Notification.insertMany(notifications, { session: session || null });
};

export const createNotificationsForEventCancellation = async (eventId: string, eventTitle: string, session?: ClientSession) => {
  // Find all active registrations for this event
  const registrations = await Registration.find({ event: eventId, status: RegistrationStatus.REGISTERED }).session(session || null);
  
  if (registrations.length === 0) return;

  const notifications = registrations.map(reg => ({
    recipient: reg.student,
    type: NotificationType.EVENT_CANCELLED,
    title: 'Event Cancelled',
    message: `The event "${eventTitle}" has been cancelled by the organizers.`,
    event: eventId,
    registration: reg._id,
  }));

  await Notification.insertMany(notifications, { session: session || null });
};
