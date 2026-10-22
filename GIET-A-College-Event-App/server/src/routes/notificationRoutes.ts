import { Router } from 'express';
import { getMyNotifications, markNotificationAsRead, getUnreadCount } from '../controllers/notificationController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Only students receive notifications currently in this phase
router.use(authenticate);
router.use(authorize([UserRole.STUDENT]));

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markNotificationAsRead);

export default router;
