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

if (!EMAIL_HOST || !EMAIL_USER || !FRONTEND_URL) {
  throw new Error('Email environment variables not configured');
}

// Create transporter ONCE
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Core send function
const send = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"EmpowerAI" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// Email verification
exports.sendVerification = async (email, token) => {
  const link = `${FRONTEND_URL}/verify?token=${token}`;

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
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;

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
