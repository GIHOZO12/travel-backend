import nodemailer from 'nodemailer';

// Email is OPTIONAL. If SMTP_HOST isn't set in .env the API still works; it
// just logs "email skipped" instead of sending. That way bookings and inquiries
// never fail because of an email problem.
export const mailConfig = {
  companyName: process.env.COMPANY_NAME || 'Ingata Travel',
  from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@localhost',
  // Where staff notifications go (new booking / inquiry). Leave empty to disable.
  notifyEmail: process.env.NOTIFY_EMAIL || '',
};

export const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      // true for port 465, false for 587/25 (STARTTLS)
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;
