import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../routes/authRoutes';
import adminEventRoutes from '../routes/adminEventRoutes';
import User, { UserRole } from '../models/User';
import Event, { EventStatus } from '../models/Event';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin/events', adminEventRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Admin Event API', () => {
  let adminToken: string;
  let studentToken: string;
  let adminId: mongoose.Types.ObjectId;
  let draftEventId: string;

  beforeAll(async () => {
    jest.setTimeout(30000);
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/giet_events_test_adminevents');

    const admin = await User.create({
      email: 'admin2@college.ac.in',
      role: UserRole.ADMIN,
      profileCompleted: true,
      name: 'Test Admin',
    });
    adminId = admin._id as mongoose.Types.ObjectId;
    adminToken = jwt.sign({ userId: admin._id.toString(), role: admin.role }, JWT_SECRET);

    const student = await User.create({
      email: 'student2@college.ac.in',
      role: UserRole.STUDENT,
      profileCompleted: true,
      name: 'Test Student',
      branch: 'CSE',
      year: '2nd Year',
    });
    studentToken = jwt.sign({ userId: student._id.toString(), role: student.role }, JWT_SECRET);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should not allow student to access admin events', async () => {
    const res = await request(app)
      .get('/api/admin/events')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(403);
  });

  it('should allow admin to create event', async () => {
    const res = await request(app)
      .post('/api/admin/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'New Admin Event',
        description: 'Test description',
        date: new Date().toISOString(),
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        venue: 'Hall 1',
        organizer: 'CSE',
        capacity: 100
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(EventStatus.DRAFT);
    expect(res.body.data.title).toBe('New Admin Event');
    
    draftEventId = res.body.data._id;
  });

  it('should list admin events including drafts', async () => {
    const res = await request(app)
      .get('/api/admin/events')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toBe('New Admin Event');
  });

  it('should allow admin to update event', async () => {
    const res = await request(app)
      .put(`/api/admin/events/${draftEventId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Updated Event Title'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Event Title');
  });

  it('should allow admin to publish draft event', async () => {
    const res = await request(app)
      .patch(`/api/admin/events/${draftEventId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: EventStatus.PUBLISHED
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(EventStatus.PUBLISHED);
  });

  it('should allow admin to unpublish event', async () => {
    const res = await request(app)
      .patch(`/api/admin/events/${draftEventId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: EventStatus.DRAFT
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(EventStatus.DRAFT);
  });

  it('should allow admin to cancel event', async () => {
    const res = await request(app)
      .patch(`/api/admin/events/${draftEventId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: EventStatus.CANCELLED
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(EventStatus.CANCELLED);
  });
});
