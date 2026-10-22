# Project Overview

**Project Name:** GIET(A) College Event Management App  
**Platform:** Android Mobile Application  
**Application ID:** `com.gieta.events`  
**Current Version:** `1.1.0` (Version Code: `2`)  
**Current Status:** Production-Ready — Stage 1 Audit (43/43 Passed), MongoDB Atlas Cloud Sharded Cluster, Live Gmail SMTP Delivery, Institutional GIET(A) Identity, Complete Student Academic Onboarding, and Executive Admin Operations Portal Live (Active on Physical Devices & Expo Metro).

---

## Tech Stack
- **Mobile Client:** React Native (`0.86.3`), Expo (`~57.0.26`, Managed Workflow), TypeScript, Hermes Engine
- **UI & Vector Graphics:** Custom SVG Vector System (`react-native-svg`), Curated GIET(A) Institutional Theme (Navy `#0E526B`, Accent Teal `#187393`, Crimson `#DC2626`, Slate `#0F172A`)
- **Backend API:** Node.js, Express.js (`5.2.1`), TypeScript
- **Database:** MongoDB Atlas (Production Cloud Cluster: `collegeeventmanagermobi.hl1fclk.mongodb.net/giet_events`), Mongoose (`9.10.3`)
- **Authentication & Email Service:** Passwordless Email OTP with live institutional Gmail SMTP delivery (TLS on port 587, 6-digit crypto integer, 5-min TTL, 60s cooldown, 3-attempt lock, single-use token consumption, branded college HTML templates)
- **Security:** Helmet, Express 5 Mongo Sanitization, Express Rate Limit, SecureStore for JWT storage, Cryptographic 64-char QR tokens (`crypto.randomBytes(32)`)
- **Build & Packaging:** EAS Build (`eas.json`), Expo Static Hermes Bundler (`expo export`)

---

## Core Capabilities

### Students (Role: `STUDENT`)
- **Institutional Authentication:** Passwordless email OTP with branded GIET(A) college email notifications.
- **Academic Onboarding:** Structured college profile registration capturing:
  - Student Full Name & Institutional Email (`@giet.edu` / authorized Gmail)
  - College Roll Number / University Registration ID
  - Department / Academic Branch (CSE, ECE, EEE, MECH, CIVIL, etc.)
  - Academic Year (1st, 2nd, 3rd, 4th Year) & Section
  - WhatsApp / Emergency Contact Phone Number
- **Event Discovery:** Browse, search, and filter published campus events by category (Technical, Cultural, Sports, Workshop, Seminar) with real-time capacity counters and calendar date badges.
- **Transactional Event Registration:** One-tap registration with server-enforced atomic capacity limits and duplicate booking prevention.
- **Digital QR Event Pass:** High-contrast, cryptographically signed scannable QR event pass (`react-native-qrcode-svg`) with hall entry instructions.
- **Attendance & Check-in Verification:** Instant status synchronization upon gate scanning at college auditoriums and labs.
- **In-App Notification Center:** Push notifications with deep links to passes, event updates, and schedule changes.
- **Verified Attendee Feedback:** Post-event 1–5 star ratings and reviews restricted exclusively to students who attended the event.
- **Clean Profile Experience:** Centralized profile management exclusively in the bottom navigation bar with session logout.

### Administrators (Role: `ADMIN`)
- **Executive Command Center (`AdminDashboardScreen`):**
  - High-energy Executive Hero Banner with active session indicators (`Odd Sem 2026`) and direct 1-tap quick action launchers (`+ Create Event`, `📷 Scan Passes`).
  - **Unified Horizon Metric Bar:** 4-column compact pipeline deck (`Total`, `Published`, `Drafts`, `Cancelled`) with indicator dots and tap-to-filter navigation.
  - **2x2 Command Grid:** Quick operations hub for Create Event, Gate Scanner, Event Rosters, and Live Attendance Audits.
  - **Recent Campus Events Stream:** Institutional calendar date tiles (Crimson month header, bold day, weekday), status pills, venue pins, and direct management links.
  - **Campus Gate Security Notice:** Real-time synchronization notice with MongoDB servers for hall turnstiles.
- **Full Event Lifecycle Management (`AdminEventsScreen` & `AdminEventDetailsScreen`):**
  - Create drafts, edit schedule/venue/capacity, publish to students, unpublish to drafts, and cancel events.
  - **Cancelled Event Recovery:** Capability to restore cancelled events back to drafts for rescheduling and editing.
  - Search by title, venue, or category, with status tabs (`ALL`, `PUBLISHED`, `DRAFT`, `CANCELLED`).
- **Gate Attendance Scanner (`ScanAttendanceScreen` & `CheckInResultScreen`):**
  - High-speed camera QR code scanner with camera permission handling.
  - Automatic cross-event scan prevention, duplicate entry warning, and real-time attendance recording.
- **Participant Rosters & Analytics (`AdminParticipantsScreen` & `AdminEventFeedbackScreen`):**
  - Student attendance rosters, hall capacity utilization, and aggregated 1–5 star rating breakdowns with qualitative reviews.
- **Vector Bottom Navigation (`AdminNavigator`):**
  - Premium SVG vector icons (`DashboardTabIcon`, `EventsTabIcon`, `AttendanceTabIcon`, `UserTabIcon`) replacing legacy emojis.

---

## Source of Truth Documents
The project strictly adheres to the following documentation files in the `docs/` folder:
1. `prd.md` — Product Requirements Document (features, scope, and technical acceptance criteria)
2. `architecture.md` — Technical architecture, database schemas, and API contracts
3. `rules.md` — Business rules, security constraints, and UI guidelines
4. `designe.md` — UI/UX screen inventory, design tokens, and aesthetic standards
5. `tasks.md` — Phased development roadmap (Phases 0 through 15 completed)
6. `memory.md` — Locked project decisions and context constraints
7. `project-overview.md` — High-level milestone summary and active deployment status

---

## Development Milestones & Updates Log

- **Phase 0: Project Setup & Foundation**
  - Initialized fresh project structure (`GIET-A-College-Event-App/`).
  - Created `mobile` workspace (React Native + Expo Managed Workflow).
  - Created `server` workspace (Node.js + Express + TypeScript).
  - Set up source-of-truth documentation in `docs/` and initialized Git tracking.
  - Configured `.env.example` and base TypeScript configs.

- **Phase 1: Passwordless Email OTP Authentication**
  - Built secure OTP generation (`crypto.randomInt`), bcrypt hashing, 60s cooldown, and 5-min TTL in MongoDB.
  - Configured Nodemailer SMTP email service with development terminal mock fallback.
  - Created JWT signing and authentication middleware.
  - Built mobile Auth context and secure token persistence using `expo-secure-store`.
  - Implemented Splash, Welcome, Email Login, OTP Verification, and Complete Profile screens.

- **Phase 2: Profile, RBAC & Role-Based Navigation**
  - Built `/api/profile` endpoints with server-enforced role authorization (`authorize(['STUDENT', 'ADMIN'])`).
  - Added role-based navigation guards dynamically mounting `StudentNavigator` or `AdminNavigator`.
  - Built student profile and edit profile layouts with instant local state refresh.
  - Configured Axios interceptors for automatic Bearer token injection and 401 handling.

- **Phase 3: Student Event Discovery**
  - Implemented `Event` model supporting `DRAFT`, `PUBLISHED`, and `CANCELLED` statuses.
  - Exposed `/api/events` APIs tailored for students, rigorously stripping draft events.
  - Integrated MongoDB `$text` search index for fast title and description queries.
  - Built `StudentHomeScreen`, `EventsScreen`, and `EventDetailsScreen` with search, category filtering, and pull-to-refresh.

- **Phase 4: Student Event Registration**
  - Implemented `Registration` model with strict capacity validation and duplicate prevention (`{ student: 1, event: 1 }`).
  - Wired up `RegistrationConfirmationScreen` and `MyRegistrationsScreen`.

- **Phase 5: Secure QR Event Pass**
  - Implemented cryptographically random 64-character hex `qrToken` (`crypto.randomBytes(32)`).
  - Built `QREventPassScreen` utilizing `react-native-qrcode-svg` with high-contrast quiet zone and responsive scroll container.

- **Phase 6: Admin Event Management**
  - Created `/api/admin/events` endpoints restricting CRUD actions to the Admin role.
  - Built `AdminDashboardScreen`, `AdminEventsScreen`, `CreateEventScreen`, and `EditEventScreen`.

- **Phase 7: Attendance & QR Scanner**
  - Implemented atomic QR check-in API with duplicate and cross-event scan validation.
  - Integrated `expo-camera` securely in `ScanAttendanceScreen` with camera permission recovery UI.
  - Built `CheckInResultScreen` with immediate visual feedback for success, already checked-in, and invalid passes.

- **Phase 8: In-App Notifications**
  - Created `Notification` model and internal event triggers (`REGISTRATION_CONFIRMED`, `EVENT_UPDATED`, `EVENT_CANCELLED`, `ATTENDANCE_CONFIRMED`).
  - Added `NotificationBell` with unread badge, `NotificationsScreen`, and deep-linking `NotificationDetailsScreen`.

- **Phase 9: Feedback & Rating**
  - Built `Feedback` model with uniqueness constraint (`{ event: 1, student: 1 }`).
  - Server-side rule: only checked-in attendees can submit 1–5 star ratings and comments.
  - Built `EventFeedbackScreen`, `FeedbackSubmittedScreen`, and `AdminEventFeedbackScreen`.

- **Phase 10: Profile, Settings & Logout**
  - Built `PATCH /api/profile` preventing privilege escalation by discarding role and auth modifications.
  - Implemented Student/Admin Profile and Settings screens.
  - Finalized secure Logout flow clearing `SecureStore` and safely resetting navigation state.

- **Phase 11: Security & Reliability Audit**
  - Integrated `helmet` and custom Express 5 NoSQL sanitization.
  - Implemented global rate limiting and strict rate limits for OTP endpoints.
  - Sanitized pagination queries to prevent NoSQL injection via parameters.
  - Verified database transactions on event registration to prevent capacity race conditions.

- **Phase 12: Final UI/UX Polish & Consistency Pass**
  - Established unified design system tokens in `mobile/src/theme/index.ts` (GIET(A) brand `#006699`, typography, spacing, radii, subtle shadows).
  - Built reusable component suite: `Button`, `Card`, `Input`, `Badge`, `EmptyState`, `ErrorState`, `NotificationBell`, and `Watermark`.
  - Polished all 20 student screens, all admin screens, authentication flows, error states, and responsive safe-area layouts.
  - Upgraded Admin Dashboard with live statistics and added Admin Participants roster screen.
  - Added bottom tab bar icons and eliminated duplicate navigation headers.

- **Phase 13: Android Release Build & Final Release Preparation**
  - **App Identity:** Finalized name as `"GIET(A) College Event Management"`, package `"com.gieta.events"`, version `"1.0.0"`, versionCode `1`.
  - **Permissions:** Scoped strictly to `CAMERA` (for admin QR attendance scanning) and `INTERNET`. Explicitly stripped microphone/audio permissions.
  - **Unified API Client:** Built `mobile/src/api/client.ts` supporting `EXPO_PUBLIC_API_URL` environment variables with dev fallbacks. Refactored all 8 mobile API modules to utilize it.
  - **Backend Production Readiness:** Connected server to MongoDB automatically via `MONGO_URI`. Resolved Express 5 NoSQL sanitization compatibility. Enabled native mobile CORS handling.
  - **Build Profiles (`mobile/eas.json`):**
    - `preview` / `production-apk`: Standalone APK for direct on-device installation and internal testing.
    - `production`: Android App Bundle (AAB) for Google Play Store publication.
  - **Security & Signing:** Hardened `.gitignore` to strictly exclude `*.keystore`, `*.jks`, `*.apk`, `*.aab`, and `credentials.json`.
  - **Verification:**
    - Mobile TypeScript check: 0 errors.
    - Server TypeScript check: 0 errors.
    - Production static export: 1,214 modules bundled to Hermes bytecode in `mobile/dist/`.
    - Live backend test: Server startup, MongoDB connection, health check, and OTP authentication flow successfully verified.

- **Stage 1: Comprehensive Normal Testing Audit & Hardening (Completed)**
  - **Audit Scope:** Following a strict three-stage release model (Stage 1: Normal Testing Audit -> Stage 2: Android APK Build & Device Testing -> Stage 3: Play Store Release), completed deep end-to-end testing of the development environment.
  - **Defect Identification & Resolution:**
    1. *Scoped Student Authorization in `registrationRoutes.ts`:* Refactored router-level `router.use(authenticate)` and `router.use(authorize([UserRole.STUDENT]))` to route-specific handler tuples, preventing registration routes mounted under `/api` from intercepting subsequent `/api/admin/*` routes with HTTP 403 Forbidden.
    2. *Standalone MongoDB Transaction Resilience in `registrationController.ts`:* Implemented dynamic database topology detection (`isReplicaSet`). On MongoDB replica sets, ACID multi-document transactions are utilized; on standalone single-node developer instances, it falls back cleanly to atomic queries and unique compound indexes (`{ student: 1, event: 1 }`), preventing transaction unsupported crashes.
    3. *Safe Recipient ObjectId String Extraction in `adminEventController.ts`:* Fixed CastError in attendance check-in notification dispatch (`Cast to ObjectId failed for value "[object Object]"`). Safely extracted `student._id` string when the student document is populated with academic profile data.
  - **Automated Verification Suite:** Executed 43 distinct automated integration tests with a **100% pass rate (43/43 passed)** covering:
    - Server startup, database connection, and health endpoint (`GET /api/health`).
    - Email OTP validation, cooldown (60s), failed attempt lockout (3 attempts), 5-minute expiry, and single-use token consumption.
    - RBAC enforcement (blocking students from `/api/admin/*` endpoints) and privilege escalation protection during profile updates.
    - Admin event lifecycle (create draft, edit capacity/venue, publish, cancel).
    - Student event discovery (drafts/cancelled hidden from student listings, search and category filtering verified).
    - Transactional event registration with capacity limits and duplicate registration rejection (HTTP 409).
    - Cryptographic 64-character QR pass generation with zero PII/sensitive data leakage.
    - Admin QR scanner attendance check-in (unmapped QR rejection, cross-event scan rejection, valid check-in recording, and duplicate scan handling).
    - Pre-check-in feedback rejection (HTTP 403) and verified attendee feedback submission with duplicate review rejection (HTTP 409).
    - Admin feedback roster and calculated rating aggregates.
    - In-app notification creation, unread count tracking, and mark-as-read.
  - **Quality Gates & Local Execution:**
    - Mobile TypeScript check: `tsc --noEmit` -> 0 errors.
    - Server TypeScript build: `tsc` -> 0 errors.
    - Static Hermes bundle export: 1,214 modules bundled without errors.
    - Both backend server and Expo mobile application verified running locally in developer environment.
  - **Release Status:** `STAGE 1 COMPLETE & AUDITED (100% PASS) — READY FOR STAGE 2: ANDROID APK BUILD & PHYSICAL-DEVICE TESTING`.

- **Infrastructure Upgrade: MongoDB Atlas Cloud & Live Gmail SMTP Delivery (Completed)**
  - **Database Cloud Migration:**
    - Transitioned from local single-node MongoDB to a production cloud cluster on **MongoDB Atlas** (`collegeeventmanagermobi.hl1fclk.mongodb.net/giet_events`).
    - Successfully connected to the primary replica set shard (`ac-amuvixw-shard-00-01.hl1fclk.mongodb.net`).
    - Re-executed the complete 43-check Stage 1 test suite against MongoDB Atlas with **100% pass rate (43/43 passed)**.
  - **Live Production Email (SMTP) Integration:**
    - Upgraded from development mock OTP terminal logging to **live Gmail SMTP delivery** via Nodemailer (`smtp.gmail.com` on TLS port 587).
    - Authenticated with Google App Password credentials and tested end-to-end transport verification.
    - Verified live test email transmission to recipient inbox (Message ID: `<ea8c0be7-506a-035d-d803-40c02937e27e@gmail.com>`).
  - **Environment & Security Hardening:**
    - Both MongoDB Atlas cloud connection strings and Gmail SMTP credentials configured securely in git-ignored `.env` and `server/.env`.
    - Public `.env.example` template maintained with generic placeholders.

- **Phase 14: Institutional Branding, Onboarding Profile & Student Experience Modernization**
  - **Professional Institutional Email Templates:**
    - Engineered rich HTML email templates replacing raw text for OTP verification.
    - Embedded official GIET (Autonomous) insignia, accreditation banners, institutional colors (Navy `#0E526B`, Crimson `#DC2626`, Gold `#F59E0B`), security guidelines, 5-minute expiry countdowns, and official campus footer.
  - **Authentication Screen Bug Fixes:**
    - Resolved soft-keyboard activation blockages on the Login screen by upgrading `KeyboardAvoidingView` wrapper behavior and wrapping input fields in `TouchableWithoutFeedback`.
  - **Comprehensive Student Profile Onboarding:**
    - Replaced generic single-field inputs with a multi-field academic registry form:
      - Full Name & Academic Email
      - College Roll Number / University Registration ID
      - Department / Branch dropdown picker (CSE, ECE, EEE, MECH, CIVIL, etc.)
      - Academic Year (1st, 2nd, 3rd, 4th) & Section
      - WhatsApp / Contact Phone Number
  - **Student Experience & Greeting Refinements:**
    - Fixed greeting header across student screens to display the user's parsed **first name** (`"Hello, Aditya 👋"`) instead of raw email address strings.
    - Eliminated redundant profile touchpoints (removed avatar button from top header and profile card from home screen); consolidated profile access exclusively within the bottom tab navigation.
    - Integrated transparent GIET Autonomous college crest logos into mobile assets (`assets/giet-logo-transparent.png`).

- **Phase 15: Executive Admin Portal Overhaul, Vector Iconography & Lifecycle Management**
  - **Admin Role Assignment & Server Synchronisation:**
    - Configured `kaditya39546@gmail.com` as an institutional `ADMIN` in MongoDB Atlas (`giet_events`) via automated setup script `setAdmin.ts`.
    - Updated `ADMIN_EMAILS` across `server/.env` and `authController.ts` for automated privilege grants upon registration/login.
  - **Complete Admin Operations Dashboard Overhaul (`AdminDashboardScreen`):**
    - **Eliminated Bloated Vertical Metrics:** Removed the 4 giant full-width pastel boxes that consumed 350px+ of vertical space.
    - **Unified Horizon Metric Bar:** Built a single compact 4-column KPI strip (`Total`, `Published`, `Drafts`, `Cancelled`) with indicator dots, bold counts, and direct tap-to-filter navigation to the event list.
    - **Executive Command Banner:** Engineered a deep navy (`#0A2540`) hero card with glowing accent lines, `🛡️ ADMINISTRATOR CONTROL` tag, dynamic first-name greeting, and direct 1-tap `+ Create New Event` and `📷 Scan Passes` action buttons.
    - **2x2 Command Grid:** Built a resilient 2-row, 2-column flex operations hub (Create Event, QR Scanner, Manage Events, Participants) with themed icon badges.
    - **Recent Campus Events Elevation:** Integrated GIET Calendar Date Tiles (Crimson month header, bold day, weekday label), status pills, venue pins, and `Manage →` action links.
    - **Campus Gate Security Banner:** Added an institutional security notice for QR pass validation at campus turnstiles.
  - **Vector SVG System (`FormIcons.tsx` & `AdminNavigator.tsx`):**
    - Replaced all raw emojis across bottom navigation tabs with custom vector SVGs:
      - `DashboardTabIcon` (Admin Dashboard)
      - `EventsTabIcon` (Event Directory)
      - `AttendanceTabIcon` (Participant Attendance)
      - `UserTabIcon` (Admin Profile)
    - Added `ArrowRightIcon`, `PulseIcon`, `ShieldIcon`, and `QrScanIcon` for crisp rendering across all screen densities.
  - **Event Lifecycle Actions & Recovery (`AdminEventDetailsScreen`):**
    - Resolved lifecycle limitation where cancelled events showed no action buttons.
    - Added `↩️ Restore Event to Draft`, `✏️ Edit Event Details`, and `⭐ View Feedback & Ratings` actions for cancelled events, allowing seamless rescheduling.
  - **Zero Compilation Errors & Live Hot-Reload:**
    - Verified `npx tsc --noEmit` exits with 0 errors across both `mobile` and `server`.
    - Live Expo Metro bundler hot-reloaded all changes directly to physical devices.
