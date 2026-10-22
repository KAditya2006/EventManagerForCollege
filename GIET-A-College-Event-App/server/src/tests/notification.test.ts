import mongoose from 'mongoose';
import Notification, { NotificationType } from '../models/Notification';
import { createNotification, createNotificationsForEventUpdate } from '../services/notificationService';
import Registration, { RegistrationStatus } from '../models/Registration';
import User, { UserRole } from '../models/User';
import Event, { EventStatus } from '../models/Event';

describe('Notification Service & Model Tests', () => {
  let studentId: string;
  let eventId: string;
  let registrationId: string;

  beforeAll(() => {
    studentId = new mongoose.Types.ObjectId().toString();
    eventId = new mongoose.Types.ObjectId().toString();
    registrationId = new mongoose.Types.ObjectId().toString();
  });

  afterAll(async () => {
    // Teardown mock or DB
  });

  it('should construct a valid Notification model', () => {
    const notification = new Notification({
      recipient: studentId,
      type: NotificationType.REGISTRATION_CONFIRMED,
      title: 'Registration Confirmed',
      message: 'Test message',
      event: eventId,
      registration: registrationId,
    });

    expect(notification.recipient.toString()).toBe(studentId);
    expect(notification.type).toBe(NotificationType.REGISTRATION_CONFIRMED);
    expect(notification.read).toBe(false);
  });

  it('should expose createNotification service function', async () => {
    expect(typeof createNotification).toBe('function');
  });

  it('should expose createNotificationsForEventUpdate service function', async () => {
    expect(typeof createNotificationsForEventUpdate).toBe('function');
  });
});
