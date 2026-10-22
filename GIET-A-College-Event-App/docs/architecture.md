# Architecture

Target architecture:

```text
React Native + Expo Mobile App
             |
             | HTTPS REST API
             ↓
Node.js + Express + TypeScript
             |
             ↓
MongoDB + Mongoose
```

## Mobile Architecture
- **Framework:** React Native with Expo (Managed Workflow)
- **Language:** TypeScript
- **State Management:** React Context (for global state like Auth) and standard Hooks.
- **Routing:** React Navigation (or Expo Router)
- **UI System:** Custom design system built with StyleSheet, implementing the provided GIET(A) minimal, lightweight college-first UI.

## API Architecture
- **Framework:** Node.js with Express
- **Language:** TypeScript
- **Format:** RESTful JSON API
- **Middleware:** CORS, Helmet (Security), Morgan (Logging), Custom Error Handlers, Authentication/Authorization Middleware.

## Database Architecture
- **Database:** MongoDB
- **ORM:** Mongoose
- **Models:**
  - `User`: Roles, profile info, email, OTP info.
  - `Event`: Details, capacity, status, timestamps, creator.
  - `Registration`: Link between User and Event, check-in status, QR token.
  - `Feedback`: Rating, comments, linked to Registration/User/Event.

## Authentication Architecture
- **Method:** Passwordless Email OTP.
- **Flow:**
  1. User inputs email.
  2. Server generates OTP, stores hashed OTP/expiration, and sends email.
  3. User submits OTP.
  4. Server validates OTP, issues JWT.
- **Tokens:** JSON Web Tokens (JWT) for stateless session management.

## Role-Based Access Control (RBAC)
- **Roles:** `STUDENT`, `ADMIN`
- Enforced at the API level via custom middleware (e.g., `requireRole(['ADMIN'])`).
- Frontend conditionally renders navigation and screens based on role, but relies on backend for security.

## Environment Configuration
- Stored in `.env` files (not committed to source control).
- Validated on startup.
- Differentiates between development, staging, and production.

## Folder Structure (Project Root)
```
GIET-A-College-Event-App/
├── mobile/       # Expo React Native App
├── server/       # Node.js + Express API
├── shared/       # Shared TypeScript types/interfaces (if applicable)
└── docs/         # Project documentation and design references
```

## Error Handling
- Consistent API error response format (e.g., `{ success: false, error: { message, code } }`).
- Global error handling middleware in Express.
- Mobile client handles network errors, timeouts, and API errors gracefully (displaying friendly alerts or UI states).

## Security Boundaries
- JWTs signed with secure secret.
- No sensitive user data (like OTPs) returned in API responses.
- QR Codes encode non-sensitive randomized tokens, which the backend maps to registrations.
- Server-side validation for all inputs and business logic rules (e.g., capacity limits, feedback eligibility).
