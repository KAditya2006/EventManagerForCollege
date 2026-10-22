import { Router } from 'express';
import { getPublishedEvents, getEventDetails } from '../controllers/eventController';
import { submitFeedback } from '../controllers/feedbackController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Student-facing routes require authentication
router.use(authenticate);

router.get('/', getPublishedEvents);
router.get('/:id', getEventDetails);
router.post('/:eventId/feedback', submitFeedback);

export default router;
