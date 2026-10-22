import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../routes/authRoutes';
import profileRoutes from '../routes/profileRoutes';
import User, { UserRole } from '../models/User';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Profile API', () => {
  let studentToken: string;
  let adminToken: string;
  let studentId: string;
  let adminId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/giet_events_test_profile');

    const student = await User.create({
      email: 'student@college.ac.in',
      role: UserRole.STUDENT,
      profileCompleted: true,
      name: 'Test Student',
      branch: 'CSE',
      year: '2nd Year',
    });
    studentId = student._id.toString();
    studentToken = jwt.sign({ userId: studentId, role: student.role }, JWT_SECRET);

    const admin = await User.create({
      email: 'admin@college.ac.in',
      role: UserRole.ADMIN,
      profileCompleted: true,
      name: 'Test Admin',
    });
    adminId = admin._id.toString();
    adminToken = jwt.sign({ userId: adminId, role: admin.role }, JWT_SECRET);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should allow student to fetch own profile', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('student@college.ac.in');
  });

  it('should deny unauthorized access', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
  });

  it('should allow student to update allowed fields', async () => {
    const res = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ year: '3rd Year' });
    
    expect(res.status).toBe(200);
    expect(res.body.data.year).toBe('3rd Year');
  });

  it('should not allow student to update role', async () => {
    const res = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ role: UserRole.ADMIN });
    
    // The controller strips `role` and does not include it in `updateData`
    // It should either return 400 (no valid fields) or 200 without changing role
    // depending on implementation. Our implementation returns 400 if no valid fields.
    expect(res.status).toBe(400);
    
    const dbUser = await User.findById(studentId);
    expect(dbUser?.role).toBe(UserRole.STUDENT);
  });
});
