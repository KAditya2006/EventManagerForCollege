# Development Roadmap (Tasks)

## Phase 0: Fresh mobile project setup
- **Objective:** Initialize the completely fresh project structure.
- **Mobile Work:** Setup Expo React Native App (TypeScript), folder structure, navigation foundation, design tokens, typography, spacing, UI component foundations, asset handling (logo).
- **Backend Work:** Setup Express (TypeScript), MongoDB/Mongoose connection, health check endpoint, base error handling/middleware.
- **Completion Criteria:** App runs, API health check works, source of truth documents exist, git repo initialized.

## Phase 1: Passwordless Email OTP authentication - **COMPLETE**
- **Objective:** Implement the core auth mechanism.
- **Backend Work:** OTP generation, email sending, OTP verification, JWT generation. (Completed)
- **Mobile Work:** Splash screen, Onboarding, Email Login, OTP Verification screens. Auth context and secure token storage. (Completed)
- **Testing:** Verify OTP delivery, expiration, and invalid attempts. (Completed)

## Phase 2: Profile + RBAC + navigation - **COMPLETE**
- **Objective:** Complete user profiles and set up role-based navigation.
- **Backend Work:** Profile endpoint (`/api/profile`), role resolution, reusable authorization middleware. (Completed)
- **Mobile Work:** `ProfileNavigator`, `StudentNavigator`, `AdminNavigator`, profile editing screen. (Completed)

## Phase 3: Student event discovery - **COMPLETE**
- **Objective:** Allow students to view and filter published events.
- **Backend Work:** Event retrieval APIs (list, details, search, filter). (Completed)
- **Mobile Work:** Student Home, All Events, Event Details, Event Filters screens. (Completed)

## Phase 4: Student event registration - **COMPLETE**
- **Objective:** Implement event registration logic.
- **Backend Work:** Registration creation, capacity checking, duplicate prevention. (Completed)
- **Mobile Work:** Registration action in Event Details, Registration Confirmation screen, My Registrations screen. (Completed)

## Phase 5: QR event pass - **COMPLETE**
- **Objective:** Generate and display a secure QR pass for check-in.
- **Backend Work:** Generate unique random QR token associated with registration. (Completed)
- **Mobile Work:** QR Event Pass screen displaying the code securely. (Completed)

## Phase 6: Admin event management - **COMPLETE**
- **Objective:** Allow admins to manage the event lifecycle.
- **Backend Work:** CRUD endpoints for Events (draft, publish, cancel). (Completed)
- **Mobile Work:** Admin Dashboard, Event Management, Create/Edit Event screens. (Completed)

## Phase 7: Attendance + QR scanner - **COMPLETE**
- **Objective:** Enable admins to check-in students.
- **Backend Work:** Check-in API via QR token, cross-event and duplicate validations. (Completed)
- **Mobile Work:** ScanAttendanceScreen, CheckInResultScreen, update RegistrationDetails. (Completed)

## Phase 8: Notifications - **COMPLETE**
- **Objective:** Implement in-app notifications.
- **Backend Work:** Notifications model/service, triggers for registration, cancellation, update, check-in. (Completed)
- **Mobile Work:** Notification Bell, Notifications screen, Notification Details screen. (Completed)

## Phase 9: Feedback/rating - **COMPLETE**
- **Objective:** Allow eligible students to submit feedback.
- **Backend Work:** Feedback model, uniqueness constraint, feedback submission endpoint (`POST /api/events/:eventId/feedback`) validating attendance and duplicating, fetch feedback for admins (`GET /api/admin/events/:eventId/feedback`), unit tests. (Completed)
- **Mobile Work:** Event Feedback screen (`EventFeedbackScreen`), Feedback confirmation (`FeedbackSubmittedScreen`), Admin Feedback Responses (`AdminEventFeedbackScreen`), dynamic "Give Feedback" visibility logic. (Completed)

## Phase 10: Profile/settings/final UX - **COMPLETE**
- **Objective:** Complete profile management and settings.
- **Backend Work:** Profile update endpoints (`PATCH /api/profile`) enforcing valid fields. (Completed)
- **Mobile Work:** Student/Admin Profile, Edit Profile, and Settings screens. Completed Logout flow (SecureStore clear + redirect to Auth). (Completed)

## Phase 11: Security/reliability - **COMPLETE**
- **Objective:** Security review and robustness.
- **Work:** Configured `helmet` and `express-mongo-sanitize`. Implemented global API rate limiting, strict pagination input parsing to deter NoSQL payloads, and dedicated OTP limits. Audited RBAC, ownership, JWT payload and transactions on registration. Filtered out secrets from logs and env examples. (Completed)

## Phase 12: Final UI polish - **COMPLETE**
- **Objective:** Ensure the app strictly follows the "minimal + lightweight" design language and GIET(A) institutional brand guidelines.
- **Work:** Established centralized design tokens (`theme/index.ts`), refined reusable UI components (`Button`, `Card`, `Input`, `Badge`, `EmptyState`, `ErrorState`, `NotificationBell`, `Watermark`). Polished all authentication screens (Splash, Welcome, Email Login, OTP, Complete Profile), all student screens, and all admin screens including live dashboard metrics and participant rosters. Resolved double headers, added bottom tab icons, ensured minimum 48px touch targets, accessibility roles, safe area and keyboard handling. Validated compilation with zero errors across mobile and server workspaces. (Completed)

## Phase 13: Android release build & preparation - **COMPLETE**
- **Objective:** Final release configuration, identity, security, build validation, and packaging preparation for APK/AAB.
- **Work:**
  - Configured app identity and versioning in `mobile/app.json`: Name "GIET(A) College Event Management", package `com.gieta.events`, version `1.0.0`, versionCode `1`.
  - Audited Android permissions: Removed audio/microphone from camera plugin, strictly limited permissions to CAMERA and INTERNET, configured blockedPermissions against sensitive device capabilities.
  - Implemented centralized API client `mobile/src/api/client.ts` supporting `EXPO_PUBLIC_API_URL` environment variable and refactored all 8 mobile API modules to utilize it.
  - Fixed database connection and Express 5 NoSQL sanitization compatibility in `server/src/index.ts`, configured mobile CORS handling, and guarded production environment secrets.
  - Configured EAS build profiles in `mobile/eas.json` (`preview` APK, `production-apk` standalone, and `production` AAB).
  - Hardened `.gitignore` against keystores, signing keys, credentials, and build binaries.
  - Successfully verified TypeScript builds (0 errors in mobile and server), validated production Hermes Android bundle export (`npm run export`), and confirmed end-to-end OTP authentication and authorization. (Completed)

## Phase 14: Institutional Branding, Onboarding Profile & Student Experience - **COMPLETE**
- **Objective:** Modernize student authentication, academic data onboarding, institutional emails, and student dashboard experience.
- **Work:**
  - Designed and deployed branded GIET(A) HTML email templates with college insignia, official colors, and security notices.
  - Fixed mobile soft-keyboard interaction on the Login screen with improved `KeyboardAvoidingView` behavior.
  - Expanded student onboarding to capture complete academic registry data (Roll Number, Department/Branch, Academic Year, and WhatsApp Phone Number).
  - Modernized greeting header to display the user's first name dynamically instead of raw email address strings.
  - Eliminated redundant profile entry points (consolidated strictly to the bottom tab bar). (Completed)

## Phase 15: Executive Admin Portal Overhaul, Vector Iconography & Lifecycle Management - **COMPLETE**
- **Objective:** Redesign the Admin portal with an executive, modern UI/UX layout, vector SVG iconography, and lifecycle recovery actions.
- **Work:**
  - Upgraded Admin bottom tab navigation to custom SVG vector icons (`DashboardTabIcon`, `EventsTabIcon`, `AttendanceTabIcon`, `UserTabIcon`).
  - Redesigned `AdminDashboardScreen`: Replaced 4 bloated vertical cards with a unified 4-column Horizon Metric Bar, added an Executive Command Banner with 1-tap quick action launchers, and introduced a 2x2 responsive Command Grid.
  - Elevated Recent Campus Events with institutional GIET Calendar Date Badges (Crimson header strip, bold navy day, weekday), status pills, and direct `Manage →` links.
  - Enhanced `AdminEventDetailsScreen` with lifecycle recovery actions (`↩️ Restore Event to Draft`, `✏️ Edit Event Details`) for cancelled events.
  - Verified 0 TypeScript errors (`npx tsc --noEmit`) and live hot-reloaded on physical devices via Expo Metro. (Completed)


