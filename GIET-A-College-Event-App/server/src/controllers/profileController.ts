import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const user = await User.findById(userId).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('[ProfileController] getProfile error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to retrieve profile' } });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    // Extract allowed student profile fields
    const { name, rollNumber, phone, course, branch, year, semester, section } = req.body;
    
    // Explicitly prevent role updates or other sensitive fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
    if (phone !== undefined) updateData.phone = phone;
    if (course !== undefined) updateData.course = course;
    if (branch !== undefined) updateData.branch = branch;
    if (year !== undefined) updateData.year = year;
    if (semester !== undefined) updateData.semester = semester;
    if (section !== undefined) updateData.section = section;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No valid fields provided for update' } });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Keep registration records in sync with updated student info
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
            studentPhone: user.phone,
          },
        }
      );
    } catch (syncErr: any) {
      console.warn('[ProfileController] Registration sync warning:', syncErr.message);
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('[ProfileController] updateProfile error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update profile' } });
  }
};
