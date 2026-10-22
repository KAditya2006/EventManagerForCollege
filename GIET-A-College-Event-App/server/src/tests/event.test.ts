import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../routes/authRoutes';
import eventRoutes from '../routes/eventRoutes';
import User, { UserRole } from '../models/User';
import Event, { EventStatus } from '../models/Event';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Event API', () => {
  let studentToken: string;
  let adminId: mongoose.Types.ObjectId;
  let publishedEventId: string;
  let draftEventId: string;
  let cancelledEventId: string;

  beforeAll(async () => {
    jest.setTimeout(30000); // give mongo more time to connect
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/giet_events_test_events');

    const student = await User.create({
      email: 'student@college.ac.in',
      role: UserRole.STUDENT,
      profileCompleted: true,
      name: 'Test Student',
      branch: 'CSE',
      year: '2nd Year',
    });
    studentToken = jwt.sign({ userId: student._id.toString(), role: student.role }, JWT_SECRET);

    const admin = await User.create({
      email: 'admin@college.ac.in',
      role: UserRole.ADMIN,
      profileCompleted: true,
      name: 'Test Admin',
    });
    adminId = admin._id as mongoose.Types.ObjectId;

    const publishedEvent = await Event.create({
      title: 'Published Event',
      description: 'This is a published event',
      date: new Date(),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      venue: 'Main Hall',
      organizer: 'CSE Dept',
      category: 'Technical',
      status: EventStatus.PUBLISHED,
      createdBy: adminId,
    });
    publishedEventId = publishedEvent._id.toString();

    const draftEvent = await Event.create({
      title: 'Draft Event',
      description: 'This is a draft event',
      date: new Date(),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      venue: 'Main Hall',
      organizer: 'CSE Dept',
      status: EventStatus.DRAFT,
      createdBy: adminId,
    });
    draftEventId = draftEvent._id.toString();

    const cancelledEvent = await Event.create({
      title: 'Cancelled Event',
      description: 'This is a cancelled event',
      date: new Date(),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      venue: 'Main Hall',
      organizer: 'CSE Dept',
      status: EventStatus.CANCELLED,
      createdBy: adminId,
    });
    cancelledEventId = cancelledEvent._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should return only published and cancelled events for students', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    const events = res.body.data;
    expect(events.length).toBe(2);
    
    const statuses = events.map((e: any) => e.status);
    expect(statuses).toContain(EventStatus.PUBLISHED);
    expect(statuses).toContain(EventStatus.CANCELLED);
    expect(statuses).not.toContain(EventStatus.DRAFT);
  });

  it('should filter events by category', async () => {
    const res = await request(app)
      .get('/api/events?category=Technical')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Published Event');
  });

  it('should get event details for a published event', async () => {
    const res = await request(app)
      .get(`/api/events/${publishedEventId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Published Event');
  });

  it('should reject access to draft event details', async () => {
    const res = await request(app)
      .get(`/api/events/${draftEventId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('Access denied');
  });
});
