import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

/**
 * Builds a professional institutional HTML email for GIET(A) OTP verification.
 */
const buildOtpHtml = (otp: string, hasLogoAttachment: boolean): string => {
  const logoHtml = hasLogoAttachment
    ? `<img src="cid:gietlogo" width="75" height="75" alt="GIET(A) Official Logo" style="display: block; margin: 0 auto 12px; border-radius: 6px; background-color: #ffffff; padding: 4px;" />`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GIET(A) Event Portal Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Institutional Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0e526b 0%, #187393 100%); padding: 32px 24px 28px; text-align: center; border-bottom: 3px solid #dc2626;">
              ${logoHtml}
              <div style="color: #ffffff; font-size: 19px; font-weight: 800; letter-spacing: 0.8px; line-height: 24px; text-transform: uppercase;">
                Gandhi Institute for Education and Technology
              </div>
              <div style="color: #e0f2fe; font-size: 13px; font-weight: 600; letter-spacing: 1.5px; margin-top: 4px; text-transform: uppercase;">
                (Autonomous) • Bhubaneswar, Odisha
              </div>
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; margin-top: 14px; border: 1px solid rgba(255, 255, 255, 0.25);">
                Campus Event Management Portal
              </div>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 32px 28px 24px;">
              <p style="margin: 0 0 14px; font-size: 15px; color: #334155; line-height: 24px;">
                Dear Student / Campus Member,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #64748b; line-height: 22px;">
                A sign-in request was initiated for your college email on the <strong>GIET(A) Event Management App</strong>. Please use the following One-Time Password (OTP) to authenticate your account:
              </p>

              <!-- Highlighted OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #f8fafc; border: 2px dashed #187393; border-radius: 12px; padding: 22px 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                      Your Verification Code
                    </div>
                    <div style="font-size: 36px; font-weight: 800; color: #187393; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; margin: 4px 0 10px; padding-left: 10px;">
                      ${otp}
                    </div>
                    <div style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 12px;">
                      ⏱ Valid for 5 minutes only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px 16px; margin: 24px 0 16px;">
                <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 18px;">
                  <strong>Security Advisory:</strong> Never share this OTP with anyone. GIET(A) administrators, faculty, or event coordinators will <strong>never</strong> ask for your verification code.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 20px;">
                If you did not initiate this login request, someone may have mistyped your college email. You can safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Institutional Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 24px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                Gandhi Institute for Education and Technology (Autonomous)
              </div>
              <div style="font-size: 11px; color: #64748b; line-height: 17px; margin-bottom: 10px;">
                Approved by AICTE, New Delhi • Affiliated to BPUT, Odisha • Accredited by NAAC<br>
                Campus: Baniatangi, Bhubaneswar, Khurda, Odisha - 752060
              </div>
              <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                This is an automated system dispatch from the GIET(A) Campus Event Portal.<br>
                Please do not reply directly to this email.
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

export const sendOTP = async (email: string, otp: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587/TLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10s connection timeout
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      // Locate official GIET logo asset
      const logoPaths = [
        path.resolve(__dirname, '../../assets/giet-logo.png'),
        path.resolve(__dirname, '../assets/giet-logo.png'),
        path.resolve(__dirname, '../../../assets/giet-logo.png'),
        path.resolve(__dirname, '../../../../mobile/assets/giet-logo.png'),
      ];
      const validLogoPath = logoPaths.find((p) => fs.existsSync(p));

      const attachments: any[] = [];
      if (validLogoPath) {
        attachments.push({
          filename: 'giet-logo.png',
          path: validLogoPath,
          cid: 'gietlogo',
        });
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"GIET(A) Event Portal" <noreply@giet.edu>',
        to: email,
        subject: `GIET(A) Events - Your Verification Code is ${otp}`,
        text: `Dear Student,\n\nYour One-Time Password (OTP) for the GIET(A) College Event Management App is: ${otp}\n\nThis code is valid for 5 minutes. Do not share this code with anyone.\n\nGandhi Institute for Education and Technology (Autonomous), Bhubaneswar`,
        html: buildOtpHtml(otp, !!validLogoPath),
        attachments,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Professional OTP email successfully dispatched to ${email}`);
    } catch (error: any) {
      console.error(`[EmailService] Error sending OTP to ${email}:`, error);
      throw new Error(`Email dispatch failed: ${error?.message || 'SMTP connection error'}`);
    }
  } else {
    if (isProd) {
      console.warn(`[EmailService Warning] Production SMTP credentials missing in environment variables. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS on Render dashboard. Logging OTP for [${email}]: ${otp}`);
    } else {
      // Development fallback (Mock Provider)
      console.log('\n=============================================');
      console.log(`[EmailService - MOCK] Sending OTP to: ${email}`);
      console.log(`[EmailService - MOCK] OTP Code: ${otp}`);
      console.log('=============================================\n');
    }
  }
};
