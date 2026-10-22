import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User, { UserRole } from '../models/User';
import Event, { EventStatus } from '../models/Event';
import Registration from '../models/Registration';
import { generateToken } from '../utils/jwt';

describe('Admin Check-in API', () => {
  let adminToken: string;
  let studentToken: string;
  let publishedEvent: any;
  let draftEvent: any;
  let studentUser: any;
  let adminUser: any;
  let validRegistration: any;

  beforeAll(async () => {
    adminUser = await User.create({ email: 'admin@giet.edu', role: UserRole.ADMIN, name: 'Admin', isProfileComplete: true });
    studentUser = await User.create({ email: 'student@giet.edu', role: UserRole.STUDENT, name: 'Student', isProfileComplete: true });
    
    adminToken = generateToken(adminUser._id.toString(), UserRole.ADMIN);
    studentToken = generateToken(studentUser._id.toString(), UserRole.STUDENT);

    publishedEvent = await Event.create({
      title: 'Published Event',
      description: 'Desc',
      date: new Date('2026-10-10'),
      startTime: '10:00',
      endTime: '12:00',
      venue: 'Room 1',
      organizer: 'Org',
      capacity: 10,
      status: EventStatus.PUBLISHED,
      createdBy: adminUser._id
    });

    draftEvent = await Event.create({
      title: 'Draft Event',
      description: 'Desc',
      date: new Date('2026-10-10'),
      startTime: '10:00',
      endTime: '12:00',
      venue: 'Room 1',
      organizer: 'Org',
      capacity: 10,
      status: EventStatus.DRAFT,
      createdBy: adminUser._id
    });

    validRegistration = await Registration.create({
      student: studentUser._id,
      event: publishedEvent._id,
      qrToken: 'random_secure_token_123',
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
  });

  it('should deny check-in to unauthenticated users', async () => {
    const res = await request(app)
      .post(`/api/admin/events/${publishedEvent._id}/check-in`)
      .send({ qrToken: 'random_secure_token_123' });
    
    expect(res.status).toBe(401);
  });

  it('should deny check-in to STUDENTS', async () => {
    const res = await request(app)
      .post(`/api/admin/events/${publishedEvent._id}/check-in`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ qrToken: 'random_secure_token_123' });
    
    expect(res.status).toBe(403);
  });

  it('should reject if event is not published', async () => {
    const res = await request(app)
      .post(`/api/admin/events/${draftEvent._id}/check-in`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ qrToken: 'random_secure_token_123' });
    
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/not currently published/);
  });

  it('should reject invalid QR token (not found)', async () => {
    const res = await request(app)
      .post(`/api/admin/events/${publishedEvent._id}/check-in`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ qrToken: 'wrong_token' });
    
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/Invalid QR code/);
  });

  it('should reject check-in for the wrong event context', async () => {
    const otherEvent = await Event.create({
      title: 'Other Event',
      description: 'Desc',
      date: new Date('2026-10-10'),
      startTime: '10:00',
      endTime: '12:00',
      venue: 'Room 2',
      organizer: 'Org',
      capacity: 10,
      status: EventStatus.PUBLISHED,
      createdBy: adminUser._id
    });

    const res = await request(app)
      .post(`/api/admin/events/${otherEvent._id}/check-in`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ qrToken: 'random_secure_token_123' });
    
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/QR belongs to another event/);
  });

  it('should successfully check in a student', async () => {
    const res = await request(app)
      .post(`/api/admin/events/${publishedEvent._id}/check-in`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ qrToken: 'random_secure_token_123' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checkedIn).toBe(true);
    expect(res.body.data.student.name).toBe('Student');

    // verify db
    const regInDb = await Registration.findById(validRegistration._id);
    expect(regInDb?.checkedIn).toBe(true);
    expect(regInDb?.checkedInAt).toBeDefined();
    expect(regInDb?.checkedInBy?.toString()).toBe(adminUser._id.toString());
  });

  it('should reject duplicate check-in (already checked in)', async () => {
    const res = await request(app)
      .post(`/api/admin/events/${publishedEvent._id}/check-in`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ qrToken: 'random_secure_token_123' });
    
    expect(res.status).toBe(200); // 200 with alreadyCheckedIn flag
    expect(res.body.success).toBe(false);
    expect(res.body.alreadyCheckedIn).toBe(true);
  });
});
