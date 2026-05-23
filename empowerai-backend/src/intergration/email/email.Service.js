// REMOVED: const fetch = require('node-fetch'); — Node 24 has native fetch

// ================= CONFIG =================
const {
  BREVO_API_KEY,
  EMAIL_FROM,
  EMAIL_NAME = 'EmpowaAI',
  FRONTEND_URL,
  NODE_ENV = 'dev',
} = process.env;

// ================= STYLES =================
const baseStyle = `
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  color: #1a1a2e;
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 24px;
  background: #4F46E5;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
`;

const footerHtml = `
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
  <p style="color:#999;font-size:12px;">
    EmpowaAI – Automated message. Do not reply.
  </p>
`;

// ================= HELPERS =================
const log = (type, msg, data = {}) => {
  console[type](`[Email][${NODE_ENV}] ${new Date().toISOString()} - ${msg}`, data);
};

const escapeHtml = (str = '') =>
  str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));

const wrap = (content) => `
  <div style="${baseStyle}">
    ${content}
    ${footerHtml}
  </div>
`;

// ================= CORE SEND =================
const send = async (to, subject, html, text = '', replyTo = null) => {
  if (!BREVO_API_KEY || !EMAIL_FROM || !FRONTEND_URL) {
    log('warn', 'Missing env vars – email NOT sent');
    return;
  }

  const payload = {
    sender: { email: EMAIL_FROM, name: EMAIL_NAME },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text || 'Open this email in an HTML-compatible client.',
  };

  if (replyTo) payload.replyTo = { email: replyTo };

  for (let i = 1; i <= 2; i++) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      log('log', `Sent "${subject}" → ${to}`);
      return;

    } catch (err) {
      log('error', `Attempt ${i} failed`, { error: err.message });
      if (i === 2) throw err;
    }
  }
};

// ================= AUTH EMAILS =================
exports.sendVerification = async (email, token) => {
  const link = `${FRONTEND_URL}/verify?token=${token}`;
  await send(
    email,
    'Verify your email – EmpowaAI',
    wrap(`
      <h2>Verify your account</h2>
      <p>Click the button below to verify your email address.</p>
      <a href="${link}" style="${buttonStyle}">Verify Email</a>
      <p style="color:#999;font-size:12px;">Or copy this link: ${link}</p>
    `),
    link
  );
};

exports.sendReset = async (email, token) => {
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;
  await send(
    email,
    'Reset your password – EmpowaAI',
    wrap(`
      <h2>Password Reset</h2>
      <p>Click below to reset your password. This link expires in 1 hour.</p>
      <a href="${link}" style="${buttonStyle}">Reset Password</a>
      <p style="color:#999;font-size:12px;">Or copy this link: ${link}</p>
    `),
    link
  );
};

exports.sendEmailChange = async (email, token) => {
  const link = `${FRONTEND_URL}/confirm-email?token=${token}`;
  await send(
    email,
    'Confirm email change – EmpowaAI',
    wrap(`
      <h2>Confirm Email Change</h2>
      <p>Click below to confirm your new email address.</p>
      <a href="${link}" style="${buttonStyle}">Confirm Email</a>
      <p style="color:#999;font-size:12px;">Or copy this link: ${link}</p>
    `),
    link
  );
};

exports.sendAccountDeletion = async (email, token) => {
  const link = `${FRONTEND_URL}/confirm-delete?token=${token}`;
  await send(
    email,
    'Confirm account deletion – EmpowaAI',
    wrap(`
      <h2>Delete Account</h2>
      <p>We received a request to permanently delete your account. This cannot be undone.</p>
      <a href="${link}" style="${buttonStyle};background:#DC2626;">Confirm Delete</a>
      <p style="color:#999;font-size:12px;">If you did not request this, ignore this email.</p>
    `),
    link
  );
};

// ================= SUBSCRIPTION EMAILS =================
exports.sendSubscriptionConfirmation = async (email, name, plan, renewalDate) => {
  await send(
    email,
    `You're now on the ${plan} plan – EmpowaAI`,
    wrap(`
      <h2>Subscription Confirmed 🎉</h2>
      <p>Hi ${escapeHtml(name)}, your <strong>${escapeHtml(plan)}</strong> subscription is now active.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666;">Plan</td>
          <td style="padding:8px;border:1px solid #eee;"><strong>${escapeHtml(plan)}</strong></td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666;">Next Renewal</td>
          <td style="padding:8px;border:1px solid #eee;">${escapeHtml(renewalDate)}</td>
        </tr>
      </table>
      <a href="${FRONTEND_URL}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
    `)
  );
};

exports.sendSubscriptionCancelled = async (email, name, plan, expiryDate) => {
  await send(
    email,
    'Your subscription has been cancelled – EmpowaAI',
    wrap(`
      <h2>Subscription Cancelled</h2>
      <p>Hi ${escapeHtml(name)}, your <strong>${escapeHtml(plan)}</strong> subscription has been cancelled.</p>
      <p>You'll retain access until <strong>${escapeHtml(expiryDate)}</strong>.</p>
      <p>Changed your mind?</p>
      <a href="${FRONTEND_URL}/pricing" style="${buttonStyle}">Reactivate Plan</a>
    `)
  );
};

exports.sendSubscriptionRenewalReminder = async (email, name, plan, renewalDate, amount) => {
  await send(
    email,
    'Your subscription renews soon – EmpowaAI',
    wrap(`
      <h2>Upcoming Renewal Reminder</h2>
      <p>Hi ${escapeHtml(name)}, your <strong>${escapeHtml(plan)}</strong> plan renews on <strong>${escapeHtml(renewalDate)}</strong>.</p>
      <p>Amount: <strong>${escapeHtml(amount)}</strong></p>
      <a href="${FRONTEND_URL}/billing" style="${buttonStyle}">Manage Billing</a>
    `)
  );
};

exports.sendPaymentFailed = async (email, name, plan, retryDate) => {
  await send(
    email,
    'Payment failed – action required',
    wrap(`
      <h2>Payment Failed ⚠️</h2>
      <p>Hi ${escapeHtml(name)}, we couldn't process your payment for the <strong>${escapeHtml(plan)}</strong> plan.</p>
      <p>We'll retry on <strong>${escapeHtml(retryDate)}</strong>. Please update your payment method to avoid losing access.</p>
      <a href="${FRONTEND_URL}/billing" style="${buttonStyle};background:#DC2626;">Update Payment Method</a>
    `)
  );
};

// ================= DEVICE / SESSION EMAILS =================
exports.sendNewDeviceLogin = async (email, name, device, location, time) => {
  await send(
    email,
    'New login detected – EmpowaAI',
    wrap(`
      <h2>New Device Login Detected</h2>
      <p>Hi ${escapeHtml(name)}, we noticed a login to your account from a new device.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666;">Device</td>
          <td style="padding:8px;border:1px solid #eee;">${escapeHtml(device)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666;">Location</td>
          <td style="padding:8px;border:1px solid #eee;">${escapeHtml(location)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666;">Time</td>
          <td style="padding:8px;border:1px solid #eee;">${escapeHtml(time)}</td>
        </tr>
      </table>
      <p>If this was you, no action needed. If not, secure your account immediately.</p>
      <a href="${FRONTEND_URL}/security" style="${buttonStyle};background:#DC2626;">Secure My Account</a>
    `)
  );
};

exports.sendDeviceRevoked = async (email, name, device) => {
  await send(
    email,
    'Device removed from your account – EmpowaAI',
    wrap(`
      <h2>Device Removed</h2>
      <p>Hi ${escapeHtml(name)}, the following device was removed from your account:</p>
      <p><strong>${escapeHtml(device)}</strong></p>
      <p>If you did not do this, please secure your account immediately.</p>
      <a href="${FRONTEND_URL}/security" style="${buttonStyle}">Review Security Settings</a>
    `)
  );
};

exports.sendAllSessionsRevoked = async (email, name) => {
  await send(
    email,
    'All sessions signed out – EmpowaAI',
    wrap(`
      <h2>All Sessions Signed Out</h2>
      <p>Hi ${escapeHtml(name)}, all active sessions on your account have been terminated.</p>
      <p>If you did not initiate this, reset your password immediately.</p>
      <a href="${FRONTEND_URL}/reset-password" style="${buttonStyle};background:#DC2626;">Reset Password</a>
    `)
  );
};

// ================= USER ACTIONS =================
exports.sendWelcome = async (email, name) => {
  await send(
    email,
    'Welcome to EmpowaAI 👋',
    wrap(`
      <h2>Welcome, ${escapeHtml(name)}!</h2>
      <p>Your account is ready. We're glad to have you on board.</p>
      <a href="${FRONTEND_URL}/dashboard" style="${buttonStyle}">Get Started</a>
    `)
  );
};

exports.sendUpgrade = async (email, name, plan) => {
  await send(
    email,
    'You upgraded your plan 🎉',
    wrap(`
      <h2>Upgrade Successful</h2>
      <p>${escapeHtml(name)}, you are now on the <strong>${escapeHtml(plan)}</strong> plan.</p>
      <a href="${FRONTEND_URL}/dashboard" style="${buttonStyle}">Explore New Features</a>
    `)
  );
};

// ================= JOB SYSTEM =================
exports.sendJobApplication = async (employerEmail, applicantName, jobTitle) => {
  await send(
    employerEmail,
    `New Application: ${jobTitle}`,
    wrap(`
      <h2>New Job Application</h2>
      <p><strong>${escapeHtml(applicantName)}</strong> applied for <strong>${escapeHtml(jobTitle)}</strong>.</p>
      <a href="${FRONTEND_URL}/dashboard/applications" style="${buttonStyle}">Review Application</a>
    `)
  );
};

exports.sendApplicationConfirmation = async (userEmail, jobTitle) => {
  await send(
    userEmail,
    'Application received – EmpowaAI',
    wrap(`
      <h2>Application Sent ✅</h2>
      <p>Your application for <strong>${escapeHtml(jobTitle)}</strong> was successfully submitted.</p>
      <a href="${FRONTEND_URL}/dashboard/my-applications" style="${buttonStyle}">Track Application</a>
    `)
  );
};

// ================= SYSTEM =================
exports.sendNotification = async (email, subject, title, message) => {
  await send(
    email,
    subject,
    wrap(`
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(message)}</p>
    `)
  );
};

// ================= FEEDBACK =================
exports.sendFeedback = async (userEmail, name, message) => {
  const safeMsg = escapeHtml(message);
  await send(
    EMAIL_FROM,
    `Feedback from ${escapeHtml(name)}`,
    wrap(`<p>${safeMsg}</p>`),
    safeMsg,
    userEmail
  );
};

// ================= SURVEY =================
exports.sendSurvey = async (email, name, responses) => {
  const rows = Object.entries(responses)
    .map(([q, a]) => `
      <tr>
        <td style="padding:8px;border:1px solid #eee;"><strong>${escapeHtml(q)}</strong></td>
        <td style="padding:8px;border:1px solid #eee;">${escapeHtml(a)}</td>
      </tr>
    `)
    .join('');

  await send(
    EMAIL_FROM,
    `Survey from ${escapeHtml(name)}`,
    wrap(`<table style="width:100%;border-collapse:collapse;">${rows}</table>`),
    '',
    email
  );
};

// ================= SUPPORT =================
exports.sendSupportRequest = async (userEmail, message) => {
  await send(
    EMAIL_FROM,
    'Support Request',
    wrap(`<p>${escapeHtml(message)}</p>`),
    message,
    userEmail
  );
};

// ================= HEALTH =================
exports.isConfigured = () =>
  !!(BREVO_API_KEY && EMAIL_FROM && FRONTEND_URL);