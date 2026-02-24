/**
 * Email Service
 * Sends styled transactional emails
 * Used by AccountService for sending verification and password reset emails.
 * Can be extended in the future for other email types (e.g. notifications, newsletters).
 * Note: This service is focused on email sending and does not handle token generation or user management, which are responsibilities of AccountService.
 */

const nodemailer = require('nodemailer');

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, FRONTEND_URL } = process.env;

// Check if email is configured - make it optional for graceful degradation
const isEmailConfigured = EMAIL_HOST && EMAIL_USER && FRONTEND_URL;

if (!isEmailConfigured) {
  console.warn('⚠️  Email service not configured. Email features will be disabled.');
  console.warn('   Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and FRONTEND_URL to enable emails.');
}

// Create transporter only if configured
let transporter = null;
if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

const baseTemplate = (title, message, buttonText, buttonLink) => {
  return `
    <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:40px 0;">
      <div style="max-width:600px;margin:auto;background:white;border-radius:10px;padding:40px;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
        <h2 style="text-align:center;color:#111;">EmpowerAI</h2>
        <h3 style="color:#222;margin-top:30px;">${title}</h3>
        <p style="color:#555;line-height:1.6;">${message}</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${buttonLink}" style="background:#2563eb;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
            ${buttonText}
          </a>
        </div>
        <p style="color:#777;font-size:14px;">Or copy and paste this link into your browser:</p>
        <p style="word-break:break-all;color:#2563eb;font-size:14px;">${buttonLink}</p>
        <hr style="margin:30px 0;border:none;border-top:1px solid #eee;">
        <p style="font-size:12px;color:#999;text-align:center;">If you did not request this email you can ignore it.</p>
      </div>
    </div>
  `;
};


class EmailService {

  async send(to, subject, html) {
    if (!isEmailConfigured || !transporter) {
      console.log(`[Email] Would send email to ${to}: ${subject}`);
      console.log(`[Email] Email service not configured - skipping actual send`);
      return;
    }
    
    await transporter.sendMail({
      from: `"EmpowerAI" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent "${subject}" to ${to}`);
  }

  async sendVerification(email, token) {
    const link = `${process.env.BACKEND_URL}/api/account/verify-email?token=${token}`;
    const html = baseTemplate('Verify Your Email', 'Click the button below to verify your account. This link expires in 1 hour.', 'Verify Email', link);
    await this.send(email, 'Verify your email', html);
  }

  async sendReset(email, token) {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = baseTemplate('Reset Your Password', 'Click the button below to reset your password. This link expires in 30 minutes.', 'Reset Password', link);
    await this.send(email, 'Reset your password', html);
  }

}

module.exports = EmailService;
