import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requestOtp, verifyOtp, completeProfile } from '../controllers/authController';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Rate limiters for auth routes to prevent brute-force attacks
const requestOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, error: { message: 'Too many OTP requests from this IP, please try again after 15 minutes' } },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, error: { message: 'Too many verification attempts from this IP, please try again after 15 minutes' } },
});

router.post('/request-otp', requestOtpLimiter, requestOtp);
router.post('/verify-otp', verifyOtpLimiter, verifyOtp);

// Utility route to fetch current user profile via token
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById((req as AuthRequest).user?.id).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        rollNumber: user.rollNumber,
        idType: user.idType,
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
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch user' } });
  }
});

router.put('/profile', authenticate, completeProfile);

export default router;
