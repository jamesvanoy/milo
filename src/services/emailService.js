const nodemailer = require('nodemailer');

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

async function sendMail({ to, subject, text, html }) {
  const transporter = buildTransport();
  if (!transporter) {
    return { sent: false, mode: 'log-only' };
  }

  const from = process.env.MAIL_FROM || 'no-reply@milo.local';
  await transporter.sendMail({ from, to, subject, text, html });
  return { sent: true, mode: 'smtp' };
}

async function sendCustomerVerificationEmail({ email, firstName, verificationUrl }) {
  const subject = 'Confirm your MILO account';
  const text = `Hi ${firstName},\n\nPlease confirm your MILO account by opening this link:\n${verificationUrl}\n\nThis link expires in 24 hours.`;
  const html = `<p>Hi ${firstName},</p><p>Please confirm your MILO account by opening this link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link expires in 24 hours.</p>`;

  const result = await sendMail({
    to: email,
    subject,
    text,
    html
  });

  if (!result.sent) {
    console.log(`[MILO] Verification email not sent (SMTP not configured). Share this link manually: ${verificationUrl}`);
  }

  return result;
}

module.exports = {
  sendCustomerVerificationEmail
};
