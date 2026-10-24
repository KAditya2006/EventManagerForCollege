import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import Otp from '../models/Otp';
import { sendOTP, sendWelcomeEmail } from '../utils/email';

const generateOtp = () => {
  // Generate 6-digit OTP securely
  return crypto.randomInt(100000, 999999).toString();
};

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, error: { message: 'Valid email is required' } });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if an OTP was recently requested (Cooldown: 1 min)
    const recentOtp = await Otp.findOne({
      email: normalizedEmail,
      createdAt: { $gte: new Date(Date.now() - 60000) }, // 1 minute cooldown
    });

    if (recentOtp) {
      return res.status(429).json({ success: false, error: { message: 'OTP requested recently. Please wait a minute.' } });
    }

    // Invalidate old pending OTPs for this email
    await Otp.updateMany({ email: normalizedEmail, consumed: false }, { $set: { consumed: true } });

    const otpCode = generateOtp();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

    await Otp.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
    });

    try {
      await sendOTP(normalizedEmail, otpCode);
      return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (emailErr: any) {
      console.error(`[AuthController] Email dispatch failed:`, emailErr.message);
      return res.status(500).json({ 
        success: false, 
        error: { 
          message: `Failed to send email OTP: ${emailErr.message || 'Email delivery service error'}` 
        } 
      });
    }
  } catch (error: any) {
    console.error('[AuthController] requestOtp error:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: error?.message || 'Failed to request OTP' 
      } 
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: { message: 'Email and OTP are required' } });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find active (unconsumed) OTP challenge
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      consumed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: { message: 'No active OTP found. Please request a new one.' } });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      otpRecord.consumed = true;
      await otpRecord.save();
      return res.status(403).json({ success: false, error: { message: 'Too many failed attempts. Please request a new OTP.' } });
    }

    if (new Date() > otpRecord.expiresAt) {
      otpRecord.consumed = true;
      await otpRecord.save();
      return res.status(400).json({ success: false, error: { message: 'OTP has expired. Please request a new one.' } });
    }

    const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otpHash);

    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, error: { message: 'Invalid OTP' } });
    }

    // Mark consumed
    otpRecord.consumed = true;
    await otpRecord.save();

    const adminEmails = (process.env.ADMIN_EMAILS || 'kaditya39546@gmail.com')
      .toLowerCase()
      .split(',')
      .map(e => e.trim());
    const isAdminEmail = adminEmails.includes(normalizedEmail);

    const getCleanNameFromEmail = (em: string) => {
      const prefix = em.split('@')[0];
      const cleaned = prefix
        .replace(/[._-]+/g, ' ')
        .replace(/\d+/g, '')
        .trim();
      if (!cleaned) return prefix;
      return cleaned
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    };

    const providedName = (req.body.name && typeof req.body.name === 'string') ? req.body.name.trim() : '';

    // Find or create User
    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
      const initialName = providedName || (isAdminEmail ? 'Administrator' : getCleanNameFromEmail(normalizedEmail));
      user = await User.create({ 
        email: normalizedEmail,
        role: isAdminEmail ? UserRole.ADMIN : UserRole.STUDENT,
        profileCompleted: isAdminEmail,
        name: initialName,
      });
      isNewUser = true;

      // Send institutional welcome email asynchronously
      sendWelcomeEmail(normalizedEmail, user.name, user.role).catch((err) => {
        console.warn('[AuthController] Welcome email dispatch error:', err.message);
      });
    } else {
      let needsSave = false;
      if (isAdminEmail && user.role !== UserRole.ADMIN) {
        user.role = UserRole.ADMIN;
        user.profileCompleted = true;
        needsSave = true;
      }
      if (providedName && (!user.name || user.name !== providedName)) {
        user.name = providedName;
        needsSave = true;
      } else if (!user.name) {
        user.name = isAdminEmail ? 'Administrator' : getCleanNameFromEmail(normalizedEmail);
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as any;

    const token = jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          rollNumber: user.rollNumber,
          phone: user.phone,
          course: user.course,
          branch: user.branch,
          year: user.year,
          semester: user.semester,
          section: user.section,
          role: user.role,
          profileCompleted: user.profileCompleted,
          isNewUser, // frontend helper flag (backend is still source of truth for profile/roles)
        },
      },
    });
  } catch (error) {
    console.error('[AuthController] verifyOtp error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to verify OTP' } });
  }
};

export const completeProfile = async (req: Request, res: Response) => {
  try {
    const { name, rollNumber, phone, course, branch, year, semester, section } = req.body;
    const userId = (req as any).user.id;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Full Name is required' } });
    }

    const updateFields: any = {
      name: name.trim(),
      profileCompleted: true,
    };

    if (rollNumber) updateFields.rollNumber = rollNumber.trim();
    if (phone) updateFields.phone = phone.trim();
    if (course) updateFields.course = course.trim();
    if (branch) updateFields.branch = branch.trim();
    if (year) updateFields.year = year.trim();
    if (semester) updateFields.semester = semester.trim();
    if (section) updateFields.section = section.trim();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Keep registration records in sync with updated student name & details
    try {
      const Registration = mongoose.model('Registration');
      await Registration.updateMany(
        { student: user._id },
        {
          $set: {
            studentName: user.name,
            studentEmail: user.email,
            studentRollNumber: user.rollNumber,
            studentBranch: user.branch,
          },
        }
      );
    } catch (syncErr: any) {
      console.warn('[AuthController] Registration sync warning:', syncErr.message);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        rollNumber: user.rollNumber,
        phone: user.phone,
        course: user.course,
        branch: user.branch,
        year: user.year,
        semester: user.semester,
        section: user.section,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('[AuthController] completeProfile error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update profile' } });
  }
};
