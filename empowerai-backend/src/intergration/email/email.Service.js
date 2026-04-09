
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




const send = async (to, subject, html, replyTo = null) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const EMAIL_FROM    = process.env.EMAIL_FROM;
  const FRONTEND_URL  = process.env.FRONTEND_URL;  

  if (!BREVO_API_KEY || !EMAIL_FROM) {
    console.warn('[Email] Missing required env vars — email NOT sent.');
    console.warn({
      BREVO_API_KEY : !!BREVO_API_KEY,
      EMAIL_FROM    : !!EMAIL_FROM,
      FRONTEND_URL  : !!FRONTEND_URL,
    });
    return;
  }

  const body = {
    sender    : { email: EMAIL_FROM, name: 'EmpowaAI' },
    to        : [{ email: to }],
    subject,
    htmlContent: html,
  };

  if (replyTo) {
    body.replyTo = { email: replyTo };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method : 'POST',
    headers: {
      accept          : 'application/json',
      'api-key'       : BREVO_API_KEY,
      'content-type'  : 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo API error: ${error.message || response.statusText}`);
  }

  console.log(`[Email] Sent: "${subject}" → ${to}`);
};


exports.sendVerification = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  await send(
    email,
    'Verify your email – EmpowaAI',
    `
    <div style="${baseStyle}">
      <h2>Verify your account</h2>
      <p>Thanks for signing up! Click the button below to verify your email.</p>

      <a href="${link}" style="${buttonStyle}">Verify Email</a>

      <p style="margin-top:16px;font-size:14px;color:#666;">
        Or copy this link: <a href="${link}">${link}</a>
      </p>

      <p style="font-size:12px;color:#999;">This link expires in 1 hour.</p>
      ${footerHtml}
    </div>
    `
  );
};


exports.sendReset = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await send(
    email,
    'Reset your password – EmpowaAI',
    `
    <div style="${baseStyle}">
      <h2>Password Reset</h2>

      <p>Click the button below to reset your password.</p>

      <a href="${link}" style="${buttonStyle}">Reset Password</a>

      <p style="margin-top:16px;font-size:14px;color:#666;">
        Or copy this link: <a href="${link}">${link}</a>
      </p>

      <p style="font-size:12px;color:#999;">Link expires in 30 minutes.</p>

      <p style="font-size:12px;color:#999;">
        If you didn't request this, ignore this email.
      </p>

      ${footerHtml}
    </div>
    `
  );
};


exports.sendAccountDeletion = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/confirm-delete?token=${token}`;

  await send(
    email,
    'Confirm account deletion – EmpowaAI',
    `
    <div style="${baseStyle}">
      <h2>Confirm Account Deletion</h2>

      <p>
        We received a request to delete your account.
        <strong>This action cannot be undone.</strong>
      </p>

      <a href="${link}" style="${buttonStyle};background:#DC2626;">
        Confirm Delete
      </a>

      <p style="margin-top:16px;font-size:14px;color:#666;">
        Or copy this link: <a href="${link}">${link}</a>
      </p>

      <p style="font-size:12px;color:#999;">Link expires in 15 minutes.</p>

      ${footerHtml}
    </div>
    `
  );
};



exports.sendNotification = async (
  email,
  subject,
  title,
  message,
  ctaButton = null
) => {
  const ctaHtml = ctaButton
    ? `
      <p style="margin-top:24px;">
        <a href="${ctaButton.url}" style="${buttonStyle}">
          ${ctaButton.label}
        </a>
      </p>`
    : '';

  await send(
    email,
    subject,
    `
    <div style="${baseStyle}">
      <h2>${title}</h2>

      <div style="line-height:1.6;color:#333;">
        ${message}
      </div>

      ${ctaHtml}
      ${footerHtml}
    </div>
    `
  );
};



exports.sendFeedback = async (userEmail, userName, feedbackMessage) => {
  const ADMIN_EMAIL = process.env.EMAIL_FROM;

  // Notify admin
  await send(
    ADMIN_EMAIL,
    `User Feedback from ${userName}`,
    `
    <div style="${baseStyle}">
      <h2>New User Feedback</h2>

      <p><strong>From:</strong> ${userName} (${userEmail})</p>
      <p><strong>Submitted:</strong> ${new Date().toUTCString()}</p>

      <p style="background:#f9f9f9;padding:16px;border-left:4px solid #4F46E5;">
        ${feedbackMessage}
      </p>

      ${footerHtml}
    </div>
    `,
    userEmail
  );

  // Confirm to user
  await send(
    userEmail,
    'We received your feedback',
    `
    <div style="${baseStyle}">
      <h2>Thanks ${userName}!</h2>

      <p>Your feedback was received successfully.</p>

      <p style="background:#f9f9f9;padding:16px;border-left:4px solid #4F46E5;">
        ${feedbackMessage}
      </p>

      ${footerHtml}
    </div>
    `
  );
};




exports.sendSurvey = async (userEmail, userName, surveyResponses) => {
  const ADMIN_EMAIL = process.env.EMAIL_FROM;

  const rows = Object.entries(surveyResponses)
    .map(
      ([q, a]) => `
      <tr>
        <td style="padding:10px;border:1px solid #eee;"><strong>${q}</strong></td>
        <td style="padding:10px;border:1px solid #eee;">${a}</td>
      </tr>`
    )
    .join('');

  await send(
    ADMIN_EMAIL,
    `Survey from ${userName}`,
    `
    <div style="${baseStyle}">
      <h2>Survey Response</h2>

      <p>${userName} (${userEmail})</p>

      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>

      ${footerHtml}
    </div>
    `,
    userEmail
  );
};



exports.sendEmailChange = async (newEmail, token) => {
  const link = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

  await send(
    newEmail,
    'Confirm your new email – EmpowaAI',
    `
    <div style="${baseStyle}">
      <h2>Confirm your new email address</h2>

      <p>Click below to confirm your new email.</p>

      <a href="${link}" style="${buttonStyle}">Confirm Email</a>

      <p style="margin-top:16px;">
        Or copy this link: <a href="${link}">${link}</a>
      </p>

      ${footerHtml}
    </div>
    `
  );
};



exports.isConfigured = () =>
  !!(process.env.BREVO_API_KEY && process.env.EMAIL_FROM && process.env.FRONTEND_URL);
