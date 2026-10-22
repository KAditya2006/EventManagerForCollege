import { Router } from 'express';
import { registerForEvent, getMyRegistrations, getRegistrationDetails, getRegistrationPass } from '../controllers/registrationController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

const studentAuth = [authenticate, authorize([UserRole.STUDENT])];

router.post('/events/:eventId/register', studentAuth, registerForEvent);
router.get('/registrations', studentAuth, getMyRegistrations);
router.get('/registrations/:registrationId', studentAuth, getRegistrationDetails);
router.get('/registrations/:registrationId/pass', studentAuth, getRegistrationPass);

export default router;
