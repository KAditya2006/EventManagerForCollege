import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../routes/authRoutes';
import registrationRoutes from '../routes/registrationRoutes';
import User, { UserRole } from '../models/User';
import Event, { EventStatus } from '../models/Event';
import Registration from '../models/Registration';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', registrationRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Registration API', () => {
  let student1Token: string;
  let student2Token: string;
  let adminId: mongoose.Types.ObjectId;
  let student1Id: string;
  let publishedEventId: string;
  let fullEventId: string;
  let draftEventId: string;

  beforeAll(async () => {
    jest.setTimeout(30000);
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/giet_events_test_reg');

    const admin = await User.create({
      email: 'admin_reg@college.ac.in',
      role: UserRole.ADMIN,
      profileCompleted: true,
      name: 'Test Admin',
    });
    adminId = admin._id as mongoose.Types.ObjectId;

    const student1 = await User.create({
      email: 'student1@college.ac.in',
      role: UserRole.STUDENT,
      profileCompleted: true,
      name: 'Student One',
      branch: 'CSE',
      year: '2nd Year',
    });
    student1Id = student1._id.toString();
    student1Token = jwt.sign({ userId: student1Id, role: student1.role }, JWT_SECRET);

    const student2 = await User.create({
      email: 'student2@college.ac.in',
      role: UserRole.STUDENT,
      profileCompleted: true,
      name: 'Student Two',
      branch: 'IT',
      year: '3rd Year',
    });
    student2Token = jwt.sign({ userId: student2._id.toString(), role: student2.role }, JWT_SECRET);

    const publishedEvent = await Event.create({
      title: 'Published Event',
      description: 'A published event',
      date: new Date(),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      venue: 'Main Hall',
      organizer: 'CSE',
      status: EventStatus.PUBLISHED,
      capacity: 10,
      createdBy: adminId,
    });
    publishedEventId = publishedEvent._id.toString();

    const fullEvent = await Event.create({
      title: 'Full Event',
      description: 'A full event',
      date: new Date(),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      venue: 'Main Hall',
      organizer: 'CSE',
      status: EventStatus.PUBLISHED,
      capacity: 1, // Only 1 seat
      createdBy: adminId,
    });
    fullEventId = fullEvent._id.toString();

    const draftEvent = await Event.create({
      title: 'Draft Event',
      description: 'A draft event',
      date: new Date(),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      venue: 'Main Hall',
      organizer: 'CSE',
      status: EventStatus.DRAFT,
      createdBy: adminId,
    });
    draftEventId = draftEvent._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should allow a student to register for a published event', async () => {
    const res = await request(app)
      .post(`/api/events/${publishedEventId}/register`)
      .set('Authorization', `Bearer ${student1Token}`);
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student).toBe(student1Id);
  });

  it('should prevent duplicate registration', async () => {
    const res = await request(app)
      .post(`/api/events/${publishedEventId}/register`)
      .set('Authorization', `Bearer ${student1Token}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('already registered');
  });

  it('should prevent registration for draft event', async () => {
    const res = await request(app)
      .post(`/api/events/${draftEventId}/register`)
      .set('Authorization', `Bearer ${student1Token}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('not open');
  });

  it('should enforce capacity limits', async () => {
    // Student 1 registers for full event (takes the 1 seat)
    const res1 = await request(app)
      .post(`/api/events/${fullEventId}/register`)
      .set('Authorization', `Bearer ${student1Token}`);
    expect(res1.status).toBe(201);

    // Student 2 tries to register
    const res2 = await request(app)
      .post(`/api/events/${fullEventId}/register`)
      .set('Authorization', `Bearer ${student2Token}`);
    expect(res2.status).toBe(400);
    expect(res2.body.error.message).toContain('currently full');
  });

  it('should get registration details', async () => {
    // First list registrations to get an ID
    const listRes = await request(app)
      .get('/api/registrations')
      .set('Authorization', `Bearer ${student1Token}`);
    
    const regId = listRes.body.data[0]._id;

    const res = await request(app)
      .get(`/api/registrations/${regId}`)
      .set('Authorization', `Bearer ${student1Token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get QR pass for valid registration', async () => {
    // First list registrations to get an ID
    const listRes = await request(app)
      .get('/api/registrations')
      .set('Authorization', `Bearer ${student1Token}`);
    
    const regId = listRes.body.data[0]._id;

    const res = await request(app)
      .get(`/api/registrations/${regId}/pass`)
      .set('Authorization', `Bearer ${student1Token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pass.token).toBeDefined();
    expect(res.body.data.registration.id).toBe(regId);
  });
});
