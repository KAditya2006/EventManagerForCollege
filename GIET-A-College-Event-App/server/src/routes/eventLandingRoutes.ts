import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Event, { EventStatus } from '../models/Event';
import { GIET_LOGO_URL } from '../utils/email';

const router = express.Router();

// APK Download URL - points to GitHub release, direct asset download, or env variable
const APK_DOWNLOAD_URL = process.env.APK_DOWNLOAD_URL || 'https://github.com/KAditya2006/EventManagerForCollege/raw/main/gieta-event-manager.apk';

/**
 * Universal Smart Landing Page for Event Registration QR Code
 * Accessible at:
 *   GET /e/:eventId
 *   GET /events/:eventId/register
 */
export const handleEventLandingPage = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).send(renderErrorPage('Invalid Event Link', 'The event identifier in this QR code is invalid.'));
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send(renderErrorPage('Event Not Found', 'This event does not exist or may have been removed.'));
    }

    if (event.status === EventStatus.CANCELLED) {
      return res.status(410).send(renderErrorPage('Event Cancelled', `The event "${event.title}" has been cancelled by the organizers.`));
    }

    const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const isRegistrationOpen = event.status === EventStatus.PUBLISHED;
    const deepLinkUrl = `gieta://event/${event._id}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(event.title)} - GIET(A) Events</title>
  <meta name="description" content="Register for ${escapeHtml(event.title)} at Gandhi Institute for Education and Technology (Autonomous), Bhubaneswar.">
  <meta property="og:title" content="${escapeHtml(event.title)} - GIET(A) College Event">
  <meta property="og:description" content="Date: ${formattedDate} | Venue: ${escapeHtml(event.venue)}">
  <meta property="og:image" content="${GIET_LOGO_URL}">

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 12px 32px;
    }
    .container {
      width: 100%;
      max-width: 520px;
      background: #1e293b;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      border: 1px solid #334155;
    }
    .header-banner {
      background: linear-gradient(135deg, #0e526b 0%, #15617d 50%, #187393 100%);
      padding: 24px 20px 20px;
      text-align: center;
      border-bottom: 4px solid #dc2626;
      position: relative;
    }
    .college-logo {
      width: 72px;
      height: 72px;
      border-radius: 12px;
      background: #ffffff;
      padding: 4px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      margin-bottom: 10px;
    }
    .college-name {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      line-height: 22px;
    }
    .college-sub {
      font-size: 11px;
      font-weight: 600;
      color: #e0f2fe;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 3px 12px;
      border-radius: 20px;
      margin-top: 10px;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .content {
      padding: 24px 20px;
    }
    .event-card {
      background: #0f172a;
      border-radius: 14px;
      padding: 20px;
      border: 1px solid #334155;
      margin-bottom: 24px;
    }
    .event-category {
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .event-title {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      line-height: 28px;
      margin-bottom: 16px;
    }
    .meta-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 13.5px;
      color: #cbd5e1;
    }
    .meta-icon {
      font-size: 16px;
      margin-right: 10px;
      width: 20px;
      text-align: center;
    }
    .meta-label {
      color: #94a3b8;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-val {
      color: #f1f5f9;
      font-weight: 600;
    }
    .desc-text {
      font-size: 13px;
      color: #94a3b8;
      line-height: 21px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px dashed #334155;
    }

    /* 3-Step Guided Box */
    .steps-card {
      background: rgba(14, 82, 107, 0.15);
      border: 1px solid rgba(24, 115, 147, 0.4);
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 24px;
    }
    .steps-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    .step-item {
      display: flex;
      margin-bottom: 10px;
      font-size: 12.5px;
      color: #cbd5e1;
      line-height: 18px;
    }
    .step-num {
      background: #0e526b;
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      flex-shrink: 0;
    }

    /* Action Buttons */
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
    }
    .btn-primary:active {
      transform: scale(0.98);
    }
    .btn-download {
      background: #334155;
      color: #f8fafc;
      border: 1px solid #475569;
    }
    .footer-note {
      text-align: center;
      font-size: 11.5px;
      color: #64748b;
      line-height: 17px;
      padding-top: 14px;
      border-top: 1px solid #334155;
    }
  </style>

  <script>
    // Automatically attempt to launch the GIET mobile application
    window.addEventListener('DOMContentLoaded', function() {
      // Direct deep link intent
      var deepLink = "${deepLinkUrl}";
      
      // Attempt opening custom scheme
      setTimeout(function() {
        window.location.href = deepLink;
      }, 300);
    });
  </script>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header-banner">
      <img src="${GIET_LOGO_URL}" alt="GIET(A) Logo" class="college-logo">
      <div class="college-name">Gandhi Institute for Education and Technology</div>
      <div class="college-sub">(Autonomous) • Bhubaneswar, Odisha</div>
      <span class="badge">Campus Event Registration</span>
    </div>

    <div class="content">
      <!-- Event Overview -->
      <div class="event-card">
        <div class="event-category">${escapeHtml(event.category || 'College Event')}</div>
        <h1 class="event-title">${escapeHtml(event.title)}</h1>

        <div class="meta-item">
          <span class="meta-icon">📅</span>
          <div>
            <div class="meta-label">Date</div>
            <div class="meta-val">${formattedDate}</div>
          </div>
        </div>

        <div class="meta-item">
          <span class="meta-icon">⏰</span>
          <div>
            <div class="meta-label">Time</div>
            <div class="meta-val">${escapeHtml(event.startTime)} - ${escapeHtml(event.endTime)}</div>
          </div>
        </div>

        <div class="meta-item">
          <span class="meta-icon">📍</span>
          <div>
            <div class="meta-label">Venue</div>
            <div class="meta-val">${escapeHtml(event.venue)}</div>
          </div>
        </div>

        <div class="meta-item">
          <span class="meta-icon">🏛️</span>
          <div>
            <div class="meta-label">Organized By</div>
            <div class="meta-val">${escapeHtml(event.organizer)}</div>
          </div>
        </div>

        ${event.capacity ? `
        <div class="meta-item">
          <span class="meta-icon">👥</span>
          <div>
            <div class="meta-label">Capacity</div>
            <div class="meta-val">${event.capacity} registered students max</div>
          </div>
        </div>
        ` : ''}

        <div class="desc-text">
          ${escapeHtml(event.description)}
        </div>
      </div>

      <!-- 3-Step Guided Workflow -->
      <div class="steps-card">
        <div class="steps-title">
          📋 How to Participate in this Event
        </div>
        <div class="step-item">
          <span class="step-num">1</span>
          <div><strong>Install App:</strong> Download and install the official GIET(A) Events APK below.</div>
        </div>
        <div class="step-item">
          <span class="step-num">2</span>
          <div><strong>Complete Profile:</strong> Sign in with your college email and set your Name, Roll Number & Branch.</div>
        </div>
        <div class="step-item">
          <span class="step-num">3</span>
          <div><strong>Scan & Register:</strong> Open the event in the app or use the In-App Scanner to claim your Digital Pass!</div>
        </div>
      </div>

      <!-- Primary Action Buttons -->
      <div class="btn-group">
        <a href="${deepLinkUrl}" class="btn btn-primary" id="openAppBtn">
          📲 Open in GIET(A) App to Register
        </a>
        <a href="${APK_DOWNLOAD_URL}" class="btn btn-download" id="downloadApkBtn" download>
          📥 Download GIET Events APK (Android)
        </a>
      </div>

      <div class="footer-note">
        Already have the app? Tap <strong>"Open in GIET(A) App"</strong> above, or launch the app and tap <strong>"Scan Event QR"</strong> from the home screen.
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return res.status(200).send(html);
  } catch (error: any) {
    console.error('[EventLanding] Error rendering smart landing page:', error);
    return res.status(500).send(renderErrorPage('Server Error', 'Failed to load event details. Please try again.'));
  }
};

const escapeHtml = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const renderErrorPage = (title: string, message: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - GIET(A) Events</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #1e293b; padding: 30px; border-radius: 16px; max-width: 420px; text-align: center; border: 1px solid #334155; }
    h1 { font-size: 20px; color: #ef4444; margin-bottom: 10px; }
    p { font-size: 14px; color: #94a3b8; line-height: 22px; margin-bottom: 20px; }
    a { display: inline-block; background: #0284c7; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <a href="${APK_DOWNLOAD_URL}">Download GIET Events App</a>
  </div>
</body>
</html>
  `.trim();
};

router.get('/:eventId', handleEventLandingPage);
router.get('/:eventId/register', handleEventLandingPage);

export default router;
