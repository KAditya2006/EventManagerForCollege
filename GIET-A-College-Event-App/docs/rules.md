# Business & Development Rules

## Mobile Rule
- This is an Android mobile application built with React Native and Expo.
- Never convert it into a web frontend.

## Authentication
- **Method:** Passwordless Email OTP only.
- **Required:**
  - Email input
  - OTP verification
  - OTP expiry
  - Resend mechanism
  - Verification attempt limits
  - One-time OTP usage
- **Prohibited:**
  - Password login
  - Forgot password
  - Reset password
  - Change password

## Role Rules
- **STUDENT:** Student functionality only.
- **ADMIN:** Admin functionality only.
- Never rely only on frontend role checks. Backend authorization must enforce access rigorously.

## Event Rules
- **Statuses:**
  - `DRAFT`
  - `PUBLISHED`
  - `CANCELLED`
- Students can see only published events.

## Registration Rules
- One student can register only once per event.
- Capacity must be checked server-side to prevent overbooking.

## QR Rules
- QR token must be random.
- QR must not expose:
  - Password
  - JWT
  - Sensitive user data

## Attendance Rules
- A registration can be checked in only once.
- Support:
  - Manual check-in
  - QR check-in

## Feedback Rules
- Only checked-in registered students can submit feedback.
- One feedback per student/event.

## UI Rules
- Follow the supplied design references strictly.
- Avoid:
  - Generic AI styling
  - Excessive decoration
  - Unnecessary animation
  - Excessive gradients
  - Excessive shadows
  - Clutter
  - Fake buttons
  - Placeholder functionality presented as real functionality
