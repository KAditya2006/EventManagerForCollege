# Design Reference

## Overview
The application design must remain:
**minimal + lightweight + professional + clean + institutional**

Based on the supplied GIET(A) logo and design reference images, this document serves as the UI/UX source-of-truth.

## Visual Direction
- **Logo Usage:** The official GIET(A) logo is the primary brand asset. Do not distort, redraw, or recolor. Use it naturally on Splash, Welcome/Onboarding, and Authentication screens. For other screens, use a subtle watermark in the background (low contrast, non-interfering).
- **Typography:** Clear hierarchy, readable sans-serif fonts, strong readability.
- **Spacing:** Spacious layouts, comfortable padding and margins.
- **Components:**
  - Simple, flat cards with slight elevation/borders.
  - Buttons with clear call-to-action styling (no excessive gradients).
  - Simple, functional inputs and forms.
  - Standard bottom tabs for main navigation.
  - Simple, recognizable icons.

## Screen Inventory

### Student Screens

#### Authentication
1. **Splash:** Displays full logo and app title.
2. **Welcome / Onboarding:** Introduction to the app, features overview.
3. **Email Login:** Simple form for college email entry.
4. **OTP Verification:** 6-digit OTP input, resend timer.
5. **Complete Profile:** Form for name, branch, year, etc.

#### Main Application
6. **Home:** Student dashboard with upcoming registered events and new published events.
7. **All Events:** List of all published events.
8. **Event Filters:** Filtering by date, type, etc.
9. **Event Details:** Event image, date, time, location, about, capacity, registration button.
10. **Registration Confirmation:** Success state.
11. **My Registrations:** List of events the student has registered for.
12. **Registration Details:** Status and specific info.
13. **QR Event Pass:** Displays event details and secure QR code for check-in.
14. **Notifications:** List of unread and read alerts.
15. **Notification Details:** Full text of notification.
16. **Event Feedback:** Rating (1-5) and optional comment form.
17. **Feedback Submitted:** Success state.
18. **Student Profile:** View profile info.
19. **Edit Profile:** Update details.
20. **Settings:** App preferences.

#### Common/System
21. **Loading:** Simple spinner or skeleton screens.
22. **No Internet:** Offline state warning with retry button.
23. **Access Denied:** Authorization error.
24. **Generic Error:** Catch-all error state.
25. **Logout Confirmation:** Prompt before signing out.

### Admin Screens

#### Admin Authentication
26. **Admin Email Login**
27. **Admin OTP Verification**

#### Main Application
28. **Admin Dashboard:** Overview of total events, published, drafts, cancelled, and quick stats.
29. **Event Management:** List of events created/managed by admins.
30. **Create Event:** Form for event details, image, capacity.
31. **Edit Event:** Update existing event.
32. **Admin Event Details:** Detailed view of the event.
33. **Registered Participants:** List of students registered, search/filter, check-in status.
34. **QR Scanner:** Camera interface to scan QR passes.
35. **Check-in Result:** Success/Failure after scanning.
36. **Event Feedback:** View aggregated ratings and comments.
37. **Feedback Responses:** List of individual feedback.
38. **Admin Profile**
39. **Admin Settings**
