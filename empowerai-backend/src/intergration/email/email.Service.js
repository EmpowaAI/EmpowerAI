const fetch = require('node-fetch');

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
    log('warn', 'Missing env vars — email NOT sent');
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
      <a href="${link}" style="${buttonStyle}">Verify Email</a>
      <p>${link}</p>
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
      <a href="${link}" style="${buttonStyle}">Reset Password</a>
      <p>${link}</p>
    `),
    link
  );
};

exports.sendEmailChange = async (email, token) => {
  const link = `${FRONTEND_URL}/confirm-email?token=${token}`;

  await send(
    email,
    'Confirm email change',
    wrap(`
      <h2>Confirm Email Change</h2>
      <a href="${link}" style="${buttonStyle}">Confirm Email</a>
      <p>${link}</p>
    `),
    link
  );
};

exports.sendAccountDeletion = async (email, token) => {
  const link = `${FRONTEND_URL}/confirm-delete?token=${token}`;

  await send(
    email,
    'Confirm account deletion',
    wrap(`
      <h2>Delete Account</h2>
      <a href="${link}" style="${buttonStyle};background:#DC2626;">
        Confirm Delete
      </a>
      <p>${link}</p>
    `),
    link
  );
};

// ================= USER ACTIONS =================
exports.sendWelcome = async (email, name) => {
  await send(
    email,
    'Welcome to EmpowaAI',
    wrap(`
      <h2>Welcome ${escapeHtml(name)}</h2>
      <p>Your account is ready.</p>
    `)
  );
};

exports.sendUpgrade = async (email, name, plan) => {
  await send(
    email,
    'You upgraded your plan 🎉',
    wrap(`
      <h2>Upgrade Successful</h2>
      <p>${escapeHtml(name)}, you are now on ${escapeHtml(plan)} plan.</p>
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
      <p>${escapeHtml(applicantName)} applied for ${escapeHtml(jobTitle)}</p>
    `)
  );
};

exports.sendApplicationConfirmation = async (userEmail, jobTitle) => {
  await send(
    userEmail,
    'Application received',
    wrap(`
      <h2>Application Sent</h2>
      <p>You applied for ${escapeHtml(jobTitle)}</p>
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
        <td><strong>${escapeHtml(q)}</strong></td>
        <td>${escapeHtml(a)}</td>
      </tr>
    `)
    .join('');

  await send(
    EMAIL_FROM,
    `Survey from ${escapeHtml(name)}`,
    wrap(`<table>${rows}</table>`),
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