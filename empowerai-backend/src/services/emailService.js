/**
 * Email Service
 * Single responsibility: send transactional emails
 */

const nodemailer = require('nodemailer');

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  FRONTEND_URL
} = process.env;

// Check if email service is configured
const isEmailConfigured = EMAIL_HOST && EMAIL_USER && FRONTEND_URL;

if (!isEmailConfigured) {
  console.warn('⚠️  Email service not configured. Email features will be disabled.');
  console.warn('   Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and FRONTEND_URL to enable emails.');
}

// Create transporter ONCE (only if configured)
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

// Core send function
const send = async (to, subject, html) => {
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
};

// Email verification
exports.sendVerification = async (email, token) => {
  const link = `${FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}`;

  await send(
    email,
    'Verify your email',
    `
      <h2>Verify your account</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 1 hour.</p>
    `
  );
};

// Password reset
exports.sendReset = async (email, token) => {
  const link = `${FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  await send(
    email,
    'Reset your password',
    `
      <h2>Password reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 30 minutes.</p>
    `
  );
};

// Export config status for health checks
exports.isConfigured = isEmailConfigured;
