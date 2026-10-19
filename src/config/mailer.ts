import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Email is OPTIONAL. With no provider set, the API still works; it just logs
// "email skipped" instead of sending. That way bookings and inquiries never
// fail because of an email problem.
//
// Three ways to send, checked in this order:
//   1. Relay (EMAIL_RELAY_URL) — POSTs the email over HTTPS to the Next.js
//      frontend's /api/email route, which sends it via SMTP from Vercel. Use
//      this on Render, whose free tier blocks outbound SMTP ports.
//   2. Resend (RESEND_API_KEY) — an HTTPS API, also works on Render.
//   3. SMTP (SMTP_HOST) — any mail server, e.g. a Gmail app password. Fine
//      locally, but often blocked on free hosting tiers.
export const relay =
  process.env.EMAIL_RELAY_URL && process.env.EMAIL_RELAY_SECRET
    ? { url: process.env.EMAIL_RELAY_URL, secret: process.env.EMAIL_RELAY_SECRET }
    : null;

export const resend = !relay && process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const transporter =
  !relay && !resend && process.env.SMTP_HOST
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

export const mailConfig = {
  companyName: process.env.COMPANY_NAME || 'Ingata Travel',
  // Resend only sends from a domain you've verified with it. Until you have
  // one, its shared sandbox sender works — but only delivers to the email
  // address that owns the Resend account. Set RESEND_FROM (e.g.
  // bookings@yourdomain.com) once your domain is verified.
  // (The relay ignores this; the frontend sets its own From address.)
  from: resend
    ? process.env.RESEND_FROM || 'onboarding@resend.dev'
    : process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@localhost',
  // Where staff notifications go (new booking / inquiry). Leave empty to disable.
  notifyEmail: process.env.NOTIFY_EMAIL || '',
};

console.log(
  `[email] provider: ${relay ? 'relay' : resend ? 'resend' : transporter ? 'smtp' : 'none (emails will be skipped)'}`,
);
