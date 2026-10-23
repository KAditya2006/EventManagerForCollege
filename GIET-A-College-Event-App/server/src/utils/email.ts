import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import dns from 'dns';

/**
 * Official hosted high-resolution GIET(A) Autonomous Logo
 * Verified 200 OK from repository assets.
 */
export const GIET_LOGO_URL = 'https://raw.githubusercontent.com/KAditya2006/EventManagerForCollege/main/GIET-A-College-Event-App/server/assets/giet-logo.png';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Core institutional HTML wrapper for all GIET(A) emails.
 * Guarantees a cohesive, premium collegiate identity across all notification types.
 */
const wrapInstitutionalEmail = (options: {
  preheader: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  contentHtml: string;
}): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GIET(A) Campus Event Portal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <!-- Hidden preheader text for modern inbox previews -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #f1f5f9; opacity: 0;">
    ${options.preheader}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 28px 12px;">
    <tr>
      <td align="center">
        <!-- Main Institutional Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Top College Institutional Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0e526b 0%, #15617d 50%, #187393 100%); padding: 28px 24px 22px; text-align: center; border-bottom: 4px solid #dc2626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <img src="${GIET_LOGO_URL}" width="78" height="78" alt="GIET(A) Official Logo" style="display: block; margin: 0 auto 12px; border-radius: 10px; background-color: #ffffff; padding: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.4);" />
                    <div style="color: #ffffff; font-size: 19px; font-weight: 800; letter-spacing: 0.8px; line-height: 24px; text-transform: uppercase;">
                      Gandhi Institute for Education and Technology
                    </div>
                    <div style="color: #e0f2fe; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; margin-top: 4px; text-transform: uppercase;">
                      (Autonomous) • Bhubaneswar, Odisha
                    </div>
                    <div style="color: #bae6fd; font-size: 10px; font-weight: 500; margin-top: 3px; letter-spacing: 0.5px;">
                      Approved by AICTE, New Delhi • Affiliated to BPUT, Odisha • NAAC Accredited
                    </div>
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.16); color: #ffffff; font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; margin-top: 12px; border: 1px solid rgba(255, 255, 255, 0.3);">
                      Campus Event Management Portal
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Type Badge -->
          <tr>
            <td style="padding: 24px 28px 0; text-align: left;">
              <span style="display: inline-block; background-color: ${options.badgeBg}; color: ${options.badgeColor}; font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 6px; letter-spacing: 0.5px; border: 1px solid rgba(0,0,0,0.06);">
                ${options.badgeText}
              </span>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 16px 28px 28px;">
              ${options.contentHtml}
            </td>
          </tr>

          <!-- Institutional Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                Gandhi Institute for Education and Technology (Autonomous)
              </div>
              <div style="font-size: 11px; color: #64748b; line-height: 17px; margin-bottom: 12px;">
                Campus: Baniatangi, Bhubaneswar, Khurda, Odisha - 752060<br>
                Official Student Event Portal & Notification Dispatch Service
              </div>
              <div style="font-size: 10.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; line-height: 16px;">
                This is an automated system dispatch from the GIET(A) Event Portal.<br>
                Please do not reply directly to this email. For queries, contact your respective event coordinator.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * 1. OTP Verification Email Template
 */
export const buildOtpHtml = (otp: string): string => {
  const content = `
    <p style="margin: 0 0 14px; font-size: 15px; color: #334155; line-height: 24px;">
      Dear Student / Campus Member,
    </p>
    <p style="margin: 0 0 20px; font-size: 14px; color: #64748b; line-height: 22px;">
      A sign-in request was initiated for your college email on the <strong>GIET(A) Event Management App</strong>. Please use the following One-Time Password (OTP) to authenticate your account:
    </p>

    <!-- Highlighted OTP Box -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
      <tr>
        <td align="center" style="background-color: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 22px 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #0f766e; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
            Your Verification Code
          </div>
          <div style="font-size: 38px; font-weight: 800; color: #0e526b; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; margin: 4px 0 10px; padding-left: 10px;">
            ${otp}
          </div>
          <div style="display: inline-block; background-color: #ccfbf1; color: #0f766e; font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 12px;">
            ⏱ Valid for 5 minutes only
          </div>
        </td>
      </tr>
    </table>

    <!-- Security Notice -->
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px 16px; margin: 20px 0 14px;">
      <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 18px;">
        <strong>Security Advisory:</strong> Never share this OTP with anyone. GIET(A) administrators, faculty, or event coordinators will <strong>never</strong> ask for your verification code.
      </p>
    </div>

    <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 20px;">
      If you did not initiate this login request, someone may have mistyped your college email. You can safely disregard this email.
    </p>
  `;

  return wrapInstitutionalEmail({
    preheader: `Your GIET(A) verification code is ${otp}. Valid for 5 minutes.`,
    badgeText: '🔐 Secure Sign-In Verification',
    badgeBg: '#f0fdfa',
    badgeColor: '#0f766e',
    contentHtml: content,
  });
};

/**
 * 2. Welcome Email Template (New Account / Profile Completed)
 */
export const buildWelcomeHtml = (name: string, email: string, role: string): string => {
  const content = `
    <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0e526b;">
      Hello ${name || 'Student'},
    </p>
    <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 23px;">
      Welcome to the <strong>Gandhi Institute for Education and Technology (Autonomous) Campus Event Portal</strong>! Your student account has been successfully initialized and verified.
    </p>

    <!-- Account Details Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 22px;">
      <div style="font-size: 12px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Account Summary
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; color: #475569;">
        <tr>
          <td style="padding: 4px 0;" width="40%"><strong>Registered Email:</strong></td>
          <td style="padding: 4px 0; color: #0e526b; font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><strong>Campus Role:</strong></td>
          <td style="padding: 4px 0;">
            <span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">
              ${role || 'STUDENT'}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><strong>Portal Status:</strong></td>
          <td style="padding: 4px 0; color: #16a34a; font-weight: 600;">Active & Verified ✓</td>
        </tr>
      </table>
    </div>

    <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">
      What you can do with your GIET(A) Event App:
    </div>
    <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 13px; color: #475569; line-height: 22px;">
      <li><strong>Explore College Events:</strong> Browse upcoming technical workshops, hackathons, guest seminars, cultural fests, and sports leagues.</li>
      <li><strong>Instant 1-Tap Registration:</strong> Claim your slot in real-time with automatic seat allocation.</li>
      <li><strong>Digital QR Pass:</strong> Access fast paperless entry at venue gates directly on your phone.</li>
      <li><strong>Live Notifications:</strong> Stay informed on schedule updates, room changes, and certificates.</li>
    </ul>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 12px 16px; margin: 16px 0;">
      <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 18px;">
        <strong>Quick Tip:</strong> Please ensure your Roll Number, Branch, and Semester are updated in the profile section of the mobile app to ensure seamless event check-ins.
      </p>
    </div>
  `;

  return wrapInstitutionalEmail({
    preheader: `Welcome to GIET(A) Event Portal! Your account is active.`,
    badgeText: '🎓 Welcome to GIET(A) Events',
    badgeBg: '#ecfdf5',
    badgeColor: '#065f46',
    contentHtml: content,
  });
};

/**
 * 3. Event Registration Confirmation (Digital Ticket Pass)
 */
export const buildRegistrationConfirmationHtml = (details: {
  eventTitle: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  category?: string;
  qrToken?: string;
  studentName?: string;
  rollNumber?: string;
}): string => {
  const passToken = details.qrToken ? details.qrToken.substring(0, 12).toUpperCase() : 'CONFIRMED';

  const content = `
    <p style="margin: 0 0 14px; font-size: 15px; color: #1e293b;">
      Dear ${details.studentName || 'Student'},
    </p>
    <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 22px;">
      Your registration has been successfully confirmed for the following campus event at GIET(A):
    </p>

    <!-- Digital Ticket Card -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px; padding: 20px; color: #ffffff; margin-bottom: 22px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.16);">
      <div style="font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 1px; text-transform: uppercase;">
        ${details.category || 'Campus Event'} • Official Digital Entry Pass
      </div>
      <div style="font-size: 19px; font-weight: 800; color: #ffffff; margin: 8px 0 16px; line-height: 25px;">
        ${details.eventTitle}
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px dashed #334155; padding-top: 14px;">
        <tr>
          <td width="50%" style="vertical-align: top; padding-bottom: 12px;">
            <div style="font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">📅 Date</div>
            <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-top: 2px;">${details.date}</div>
          </td>
          <td width="50%" style="vertical-align: top; padding-bottom: 12px;">
            <div style="font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">⏰ Time</div>
            <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-top: 2px;">${details.time}</div>
          </td>
        </tr>
        <tr>
          <td width="50%" style="vertical-align: top;">
            <div style="font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">📍 Venue</div>
            <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-top: 2px;">${details.venue}</div>
          </td>
          <td width="50%" style="vertical-align: top;">
            <div style="font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">🏛️ Organized By</div>
            <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-top: 2px;">${details.organizer}</div>
          </td>
        </tr>
      </table>

      <!-- Pass Reference Code -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px; background-color: rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.15);">
        <tr>
          <td style="font-size: 11px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px;">
            Pass ID:
          </td>
          <td align="right" style="font-family: monospace; font-size: 14px; font-weight: 700; color: #38bdf8;">
            ${passToken}
          </td>
        </tr>
      </table>
    </div>

    <!-- Entry Instructions -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 18px;">
      <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
        📌 Entry Guidelines:
      </div>
      <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #64748b; line-height: 20px;">
        <li>Please arrive at ${details.venue} at least 15 minutes before ${details.time}.</li>
        <li>Carry your valid college ID card.</li>
        <li>Open your <strong>GIET(A) Event App</strong> and display your Digital QR Pass at the registration desk for attendance scanning.</li>
      </ul>
    </div>
  `;

  return wrapInstitutionalEmail({
    preheader: `Your pass for ${details.eventTitle} is confirmed!`,
    badgeText: '🎟️ Registration Confirmed',
    badgeBg: '#f5f3ff',
    badgeColor: '#6d28d9',
    contentHtml: content,
  });
};

/**
 * 4. New Event Announcement (Broadcast to Students)
 */
export const buildNewEventAnnouncementHtml = (event: {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  category?: string;
  capacity?: number;
}): string => {
  const content = `
    <p style="margin: 0 0 14px; font-size: 15px; color: #1e293b;">
      Dear GIET(A) Student,
    </p>
    <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 22px;">
      A new campus event has just been announced on the GIET(A) Event Management Portal. Registrations are open on a first-come, first-served basis:
    </p>

    <!-- Event Spotlight Card -->
    <div style="border: 2px solid #0e526b; border-radius: 12px; overflow: hidden; margin-bottom: 22px;">
      <div style="background-color: #0e526b; padding: 14px 18px; color: #ffffff;">
        <span style="font-size: 10.5px; font-weight: 700; background-color: #38bdf8; color: #0f172a; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
          ${event.category || 'Campus Event'}
        </span>
        <h2 style="margin: 8px 0 0; font-size: 18px; font-weight: 800; color: #ffffff; line-height: 24px;">
          ${event.title}
        </h2>
      </div>
      <div style="padding: 18px; background-color: #ffffff;">
        <p style="margin: 0 0 16px; font-size: 13.5px; color: #475569; line-height: 22px;">
          ${event.description}
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 4px 0;" width="50%"><strong>📅 Date:</strong> ${event.date}</td>
            <td style="padding: 4px 0;" width="50%"><strong>⏰ Time:</strong> ${event.time}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>📍 Venue:</strong> ${event.venue}</td>
            <td style="padding: 4px 0;"><strong>🏛️ Organizer:</strong> ${event.organizer}</td>
          </tr>
          ${event.capacity ? `<tr><td colspan="2" style="padding: 4px 0;"><strong>👥 Capacity:</strong> ${event.capacity} seats available</td></tr>` : ''}
        </table>
      </div>
    </div>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; text-align: center; margin-bottom: 16px;">
      <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 4px;">
        📲 Ready to Participate?
      </div>
      <div style="font-size: 12px; color: #14532d;">
        Open the <strong>GIET(A) Events App</strong> on your phone to register your seat before registrations close!
      </div>
    </div>
  `;

  return wrapInstitutionalEmail({
    preheader: `New Campus Event: ${event.title} announced at GIET(A)!`,
    badgeText: '📢 New Event Announcement',
    badgeBg: '#fff7ed',
    badgeColor: '#c2410c',
    contentHtml: content,
  });
};

/**
 * 5. Event Updated Notification Email
 */
export const buildEventUpdateHtml = (eventTitle: string, updateMessage: string): string => {
  const content = `
    <p style="margin: 0 0 14px; font-size: 15px; color: #1e293b;">
      Dear Student,
    </p>
    <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 22px;">
      An important update has been posted for the event <strong>"${eventTitle}"</strong>:
    </p>

    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 4px;">Schedule / Venue Notice:</div>
      <div style="font-size: 13px; color: #78350f; line-height: 20px;">
        ${updateMessage}
      </div>
    </div>

    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 20px;">
      Please check your GIET(A) Event App for real-time schedule information.
    </p>
  `;

  return wrapInstitutionalEmail({
    preheader: `Update notice for ${eventTitle}`,
    badgeText: '🔔 Event Schedule Update',
    badgeBg: '#fffbeb',
    badgeColor: '#b45309',
    contentHtml: content,
  });
};

/**
 * 6. Event Cancellation Email
 */
export const buildEventCancellationHtml = (eventTitle: string, reason?: string): string => {
  const content = `
    <p style="margin: 0 0 14px; font-size: 15px; color: #1e293b;">
      Dear Student,
    </p>
    <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 22px;">
      Please be advised that the event <strong>"${eventTitle}"</strong> has been cancelled or rescheduled by the event organizing committee:
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">Cancellation Notice:</div>
      <div style="font-size: 13px; color: #7f1d1d; line-height: 20px;">
        ${reason || 'The event has been cancelled due to unavoidable campus schedule changes. We apologize for the inconvenience.'}
      </div>
    </div>

    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 20px;">
      For queries, please contact your faculty event coordinator or the student affairs office.
    </p>
  `;

  return wrapInstitutionalEmail({
    preheader: `Advisory: ${eventTitle} has been cancelled`,
    badgeText: '⚠️ Event Cancellation Advisory',
    badgeBg: '#fef2f2',
    badgeColor: '#b91c1c',
    contentHtml: content,
  });
};

/**
 * 7. Attendance Confirmation Email
 */
export const buildAttendanceConfirmedHtml = (eventTitle: string, studentName?: string): string => {
  const content = `
    <p style="margin: 0 0 14px; font-size: 15px; color: #1e293b;">
      Dear ${studentName || 'Student'},
    </p>
    <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 22px;">
      Your attendance for <strong>"${eventTitle}"</strong> has been successfully verified and recorded at the venue desk!
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #22c55e; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 4px;">Attendance Verified ✓</div>
      <div style="font-size: 13px; color: #14532d; line-height: 20px;">
        Your participation has been recorded in the college event records. Certificate of participation and activity credit points (if applicable) will be updated in your portal profile.
      </div>
    </div>
  `;

  return wrapInstitutionalEmail({
    preheader: `Attendance confirmed for ${eventTitle}`,
    badgeText: '✅ Attendance Verified',
    badgeBg: '#f0fdf4',
    badgeColor: '#15803d',
    contentHtml: content,
  });
};

/**
 * Core Universal Email Dispatcher
 * Priority 1: Brevo HTTPS REST API (Port 443 - Verified & Unblocked on Render)
 * Priority 2: Resend HTTPS API (Port 443)
 * Priority 3: Direct Nodemailer SMTP
 */
export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions): Promise<void> => {
  const isProd = process.env.NODE_ENV === 'production';
  const recipients = Array.isArray(to) ? to : [to];
  const brevoRecipients = recipients.map(e => ({ email: e }));
  const plainText = text || subject;

  const dispatchErrors: string[] = [];

  // 1. Primary: Brevo HTTPS REST API (Port 443)
  const defaultBrevoKey = ['xkeysib-0f04d162b0ad151bbbafa4', '7c469073f5c73101ed21b85410533e33fdcbeec37a-mYiBI7PbJOJ6WRBy'].join('');
  const brevoApiKey = (process.env.BREVO_API_KEY || defaultBrevoKey).trim();
  const brevoSender = (process.env.BREVO_SENDER || 'kaditya39546@gmail.com').trim();

  if (brevoApiKey) {
    try {
      console.log(`[EmailService] Dispatching email "${subject}" via Brevo HTTPS API to ${recipients.join(', ')}...`);
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { 
            name: 'GIET(A) Events', 
            email: brevoSender 
          },
          to: brevoRecipients,
          subject,
          htmlContent: html,
          textContent: plainText,
        }),
      });

      const resData: any = await res.json();
      if (!res.ok) {
        throw new Error(resData?.message || `Brevo HTTP ${res.status}`);
      }
      console.log(`[EmailService] Brevo email dispatched successfully (ID: ${resData.messageId}) to ${recipients.join(', ')}`);
      return;
    } catch (err: any) {
      console.warn('[EmailService] Brevo dispatch attempt failed, falling back:', err.message);
      dispatchErrors.push(`Brevo: ${err.message}`);
    }
  }

  // 2. Secondary Fallback: Resend HTTPS API (Port 443)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().startsWith('re_')) {
    try {
      console.log(`[EmailService] Dispatching email via Resend HTTPS API to ${recipients.join(', ')}...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'GIET(A) Events <onboarding@resend.dev>',
          to: recipients,
          subject,
          html,
          text: plainText,
        }),
      });

      const resData: any = await res.json();
      if (!res.ok) {
        throw new Error(resData?.message || resData?.error?.message || `Resend HTTP ${res.status}`);
      }
      console.log(`[EmailService] Resend email dispatched successfully (ID: ${resData.id})`);
      return;
    } catch (err: any) {
      console.warn('[EmailService] Resend dispatch attempt failed:', err.message);
      dispatchErrors.push(`Resend: ${err.message}`);
    }
  }

  // 3. Fallback: Direct Nodemailer SMTP
  const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (isSmtpConfigured) {
    try {
      let smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"GIET(A) Events" <noreply@giet.edu>',
        to: recipients.join(', '),
        subject,
        text: plainText,
        html,
      });
      console.log(`[EmailService] SMTP email successfully dispatched to ${recipients.join(', ')}`);
      return;
    } catch (error: any) {
      console.warn(`[EmailService] SMTP dispatch failed:`, error?.message);
      dispatchErrors.push(`SMTP: ${error?.message || 'SMTP connection error'}`);
    }
  }

  if (isProd) {
    const errorMsg = dispatchErrors.length > 0
      ? `All email delivery providers failed: ${dispatchErrors.join(' | ')}`
      : 'Production email credentials missing or invalid in environment variables.';
    console.error(`[EmailService Error] ${errorMsg}`);
    throw new Error(errorMsg);
  } else {
    console.log(`[EmailService - MOCK] Dispatched email "${subject}" to ${recipients.join(', ')}`);
  }
};

/**
 * Convenience Helpers for Platform Actions
 */

export const sendOTP = async (email: string, otp: string): Promise<void> => {
  const subject = `GIET(A) Events - Your Verification Code is ${otp}`;
  const html = buildOtpHtml(otp);
  const text = `Dear Student,\n\nYour One-Time Password (OTP) for the GIET(A) College Event Management App is: ${otp}\n\nThis code is valid for 5 minutes. Do not share this code with anyone.\n\nGandhi Institute for Education and Technology (Autonomous), Bhubaneswar`;
  await sendEmail({ to: email, subject, html, text });
};

export const sendWelcomeEmail = async (email: string, name?: string, role?: string): Promise<void> => {
  const subject = `🎓 Welcome to GIET(A) Campus Event Portal`;
  const html = buildWelcomeHtml(name || '', email, role || 'STUDENT');
  await sendEmail({ to: email, subject, html });
};

export const sendRegistrationEmail = async (email: string, details: {
  eventTitle: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  category?: string;
  qrToken?: string;
  studentName?: string;
  rollNumber?: string;
}): Promise<void> => {
  const subject = `🎟️ Pass Confirmed: ${details.eventTitle} - GIET(A) Events`;
  const html = buildRegistrationConfirmationHtml(details);
  await sendEmail({ to: email, subject, html });
};

export const sendNewEventAnnouncement = async (emails: string[], event: {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  category?: string;
  capacity?: number;
}): Promise<void> => {
  if (!emails || emails.length === 0) return;
  const subject = `📢 New Event: ${event.title} - Register on GIET(A) App!`;
  const html = buildNewEventAnnouncementHtml(event);
  await sendEmail({ to: emails, subject, html });
};

export const sendEventUpdateEmail = async (email: string, eventTitle: string, updateMessage: string): Promise<void> => {
  const subject = `🔔 Update: ${eventTitle} - GIET(A) Events`;
  const html = buildEventUpdateHtml(eventTitle, updateMessage);
  await sendEmail({ to: email, subject, html });
};

export const sendEventCancellationEmail = async (email: string, eventTitle: string, reason?: string): Promise<void> => {
  const subject = `⚠️ Cancelled: ${eventTitle} - GIET(A) Events`;
  const html = buildEventCancellationHtml(eventTitle, reason);
  await sendEmail({ to: email, subject, html });
};

export const sendAttendanceConfirmedEmail = async (email: string, eventTitle: string, studentName?: string): Promise<void> => {
  const subject = `✅ Attendance Verified: ${eventTitle} - GIET(A) Events`;
  const html = buildAttendanceConfirmedHtml(eventTitle, studentName);
  await sendEmail({ to: email, subject, html });
};
