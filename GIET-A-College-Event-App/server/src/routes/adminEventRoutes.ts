import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { 
  getAdminEvents, 
  createEvent, 
  getAdminEventDetails, 
  updateEvent, 
  updateEventStatus,
  checkInStudent,
  getEventParticipants,
  updateEventWinners,
  updateEventEvidence,
  getAppUsers,
  getAdminDashboardSummary
} from '../controllers/adminEventController';
import { getEventFeedback } from '../controllers/feedbackController';

const router = Router();

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize([UserRole.ADMIN]));

// Dashboard summary & Users management
router.get('/summary', getAdminDashboardSummary);
router.get('/users', getAppUsers);

// Event management
router.get('/', getAdminEvents);
router.get('/events', getAdminEvents);
router.post('/', createEvent);
router.post('/events', createEvent);

router.get('/events/:id', getAdminEventDetails);
router.get('/:id', getAdminEventDetails);

router.put('/events/:id', updateEvent);
router.put('/:id', updateEvent);

router.patch('/events/:id/status', updateEventStatus);
router.patch('/:id/status', updateEventStatus);

// Participants Roster
router.get('/events/:eventId/participants', getEventParticipants);
router.get('/:eventId/participants', getEventParticipants);

// Winners Management
router.put('/events/:eventId/winners', updateEventWinners);
router.put('/:eventId/winners', updateEventWinners);

// Evidence & Prize Distribution Photos Management
router.put('/events/:eventId/evidence', updateEventEvidence);
router.put('/:eventId/evidence', updateEventEvidence);

// Attendance Gate Scanning
router.post('/events/:eventId/check-in', checkInStudent);
router.post('/:eventId/check-in', checkInStudent);

// Feedback
router.get('/events/:eventId/feedback', getEventFeedback);
router.get('/:eventId/feedback', getEventFeedback);

export default router;
