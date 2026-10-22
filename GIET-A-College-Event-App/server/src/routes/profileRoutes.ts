import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

router.get('/', getProfile);
router.patch('/', updateProfile);

export default router;
