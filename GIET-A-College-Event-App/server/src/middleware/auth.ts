import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';

    const decoded = jwt.verify(token, secret) as { userId: string; role: UserRole };

    // Verify user still exists
    const user = await User.findById(decoded.userId).select('_id role');
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'User no longer exists' } });
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { message: 'Access denied: Insufficient permissions' } });
    }

    next();
  };
};
