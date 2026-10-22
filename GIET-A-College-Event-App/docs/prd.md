# Product Requirements Document (PRD)

## Product
GIET(A) College Event Management Mobile Application.

## Primary Purpose
Centralize college event discovery, registration, attendance/check-in, communication, and feedback.

## Student Capabilities
- Passwordless email OTP login
- Profile completion
- Home/dashboard
- Browse published events
- Search events
- Filter events
- View event details
- Register for events
- View registrations
- View event QR pass
- View attendance/check-in status
- Receive notifications
- Submit eligible event feedback
- View/manage profile
- Settings

## Admin Capabilities
- Passwordless email OTP login
- Admin dashboard
- Create event
- Edit event
- Publish event
- Unpublish event
- Cancel event
- View participants
- Search/filter participants
- Manual check-in
- QR scanning/check-in
- View feedback
- Admin profile/settings

## Feedback Rule
A student can submit feedback only if:
1. Authenticated
2. Role is STUDENT
3. Event exists
4. Student registered for the event
5. Student has CHECKED_IN attendance status
6. Student has not already submitted feedback

**Rating:** 1–5
**Comment:** Optional.
