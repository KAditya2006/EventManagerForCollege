import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { 
  getAdminEvents, 
  createEvent, 
  getAdminEventDetails, 
  updateEvent, 
  updateEventStatus,
  checkInStudent
} from '../controllers/adminEventController';
import { getEventFeedback } from '../controllers/feedbackController';

const router = Router();

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize([UserRole.ADMIN]));

router.get('/', getAdminEvents);
router.post('/', createEvent);
router.get('/:id', getAdminEventDetails);
router.put('/:id', updateEvent);
router.patch('/:id/status', updateEventStatus);
router.post('/:eventId/check-in', checkInStudent);
router.get('/:eventId/feedback', getEventFeedback);

export default router;
