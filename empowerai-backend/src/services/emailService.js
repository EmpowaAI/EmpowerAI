/**
 * Email Service
 * Sends styled transactional emails via Brevo HTTP API.
 * Using HTTP API instead of SMTP to avoid port blocking on restricted hosting environments.
 * Used by AccountService for sending verification and password reset emails.
 */

const { BREVO_API_KEY, EMAIL_FROM, FRONTEND_URL, BACKEND_URL } = process.env;

const isEmailConfigured = BREVO_API_KEY && EMAIL_FROM && FRONTEND_URL && BACKEND_URL;

if (!isEmailConfigured) {
  console.warn('⚠️  Email service not configured. Email features will be disabled.');
  console.warn('   Set BREVO_API_KEY, EMAIL_FROM, FRONTEND_URL, and BACKEND_URL to enable emails.');
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
    if (!isEmailConfigured) {
      console.log(`[Email] Would send email to ${to}: ${subject}`);
      console.log(`[Email] Email service not configured - skipping actual send`);
      return;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'EmpowerAI', email: EMAIL_FROM },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error: ${error.message || response.statusText}`);
    }

    console.log(`[Email] Sent "${subject}" to ${to}`);
  }


  async sendVerification(email, token) {
    const link = `${BACKEND_URL}/api/account/verify-email?token=${token}`;
    const html = baseTemplate(
      'Verify Your Email',
      'Click the button below to verify your account. This link expires in 1 hour.',
      'Verify Email',
      link
    );
    await this.send(email, 'Verify your email', html);
  }


  async sendReset(email, token) {
    const link = `${FRONTEND_URL}/reset-password?token=${token}`;
    const html = baseTemplate(
      'Reset Your Password',
      'Click the button below to reset your password. This link expires in 30 minutes.',
      'Reset Password',
      link
    );
    await this.send(email, 'Reset your password', html);
  }

}

module.exports = EmailService;
