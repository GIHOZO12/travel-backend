import { mailConfig, relay, resend, transporter } from '../config/mailer';
import {
  AdminAccountEmailData,
  BookingEmailData,
  InquiryEmailData,
  customerBookingReceived,
  customerBookingStatus,
  customerInquiryReceived,
  staffInvite,
  staffNewBooking,
  staffNewInquiry,
  staffRoleChanged,
} from './emailTemplates';
import { INVITE_EXPIRY_HOURS } from '../utils/inviteToken';

interface Message {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

// Sending an email must NEVER break the request that triggered it: a visitor's
// booking is already saved, so a mail-server hiccup is only logged.
async function send(message: Message): Promise<void> {
  const from = `${mailConfig.companyName} <${mailConfig.from}>`;

  try {
    if (relay) {
      const started = Date.now();
      console.log(`[email] relaying "${message.subject}" to ${message.to} via ${relay.url}`);

      let res: Response;
      try {
        res = await fetch(relay.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${relay.secret}` },
          body: JSON.stringify(message),
          signal: AbortSignal.timeout(20_000),
        });
      } catch (error) {
        // Never reached the frontend: wrong URL, DNS, Vercel down, or timeout.
        const reason =
          error instanceof Error && error.name === 'TimeoutError'
            ? 'timed out after 20s'
            : error instanceof Error
              ? `${error.message}${error.cause ? ` (${String(error.cause)})` : ''}`
              : String(error);
        console.error(`[email] relay unreachable for "${message.subject}" to ${message.to}: ${reason} — check EMAIL_RELAY_URL`);
        return;
      }

      // The relay answers with { id, ... }; that id matches its "[email <id>]" lines in Vercel's logs.
      const text = await res.text().catch(() => '');
      const json = (() => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })();
      const ref = json?.id ? ` [vercel id ${json.id}]` : '';

      if (!res.ok) {
        const hint =
          res.status === 401
            ? ' — EMAIL_RELAY_SECRET differs between Render and Vercel'
            : res.status === 503
              ? ' — SMTP settings missing on Vercel (redeploy after adding them)'
              : res.status === 404
                ? ' — wrong EMAIL_RELAY_URL or the frontend is not deployed with /api/email'
                : '';
        console.error(
          `[email] relay FAILED "${message.subject}" to ${message.to}: HTTP ${res.status} in ${Date.now() - started}ms${ref}${hint}`,
          json ?? text.slice(0, 500),
        );
        return;
      }
      console.log(`[email] sent via relay: "${message.subject}" to ${message.to} in ${Date.now() - started}ms${ref}`);
      return;
    }

    if (resend) {
      const { data, error } = await resend.emails.send({ from, ...message });
      if (error) {
        console.error(`[email] resend rejected "${message.subject}" to ${message.to}:`, error.message);
        return;
      }
      console.log(`[email] sent via resend: "${message.subject}" to ${message.to} (id ${data.id})`);
      return;
    }

    if (transporter) {
      await transporter.sendMail({ from, ...message });
      console.log(`[email] sent via smtp: "${message.subject}" to ${message.to}`);
      return;
    }

    console.log(`[email] skipped (no email provider configured): ${message.subject}`);
  } catch (error) {
    console.error(`[email] failed to send "${message.subject}" to ${message.to}:`, error instanceof Error ? error.message : error);
  }
}

// Staff notification + customer confirmation for a new booking request.
export async function notifyNewBooking(booking: BookingEmailData): Promise<void> {
  const staff = staffNewBooking(mailConfig.companyName, booking);
  const customer = customerBookingReceived(mailConfig.companyName, booking);

  await Promise.all([
    mailConfig.notifyEmail
      ? send({ to: mailConfig.notifyEmail, replyTo: booking.email, ...staff })
      : Promise.resolve(),
    send({ to: booking.email, ...customer }),
  ]);
}

// Tells the customer when staff change the booking status (confirmed, etc.).
export async function notifyBookingStatusChange(booking: BookingEmailData): Promise<void> {
  const customer = customerBookingStatus(mailConfig.companyName, booking);
  if (!customer) return;
  await send({ to: booking.email, ...customer });
}


export async function notifyStaffInvite(admin: AdminAccountEmailData, rawToken: string): Promise<void> {
  const setPasswordUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/set-password?token=${rawToken}`;
  const message = staffInvite(mailConfig.companyName, admin, setPasswordUrl, INVITE_EXPIRY_HOURS);
  await send({ to: admin.email, ...message });
}


export async function notifyRoleChanged(admin: AdminAccountEmailData): Promise<void> {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/login`;
  const message = staffRoleChanged(mailConfig.companyName, admin, loginUrl);
  await send({ to: admin.email, ...message });
}

export async function notifyNewInquiry(inquiry: InquiryEmailData): Promise<void> {
  const staff = staffNewInquiry(mailConfig.companyName, inquiry);
  const customer = customerInquiryReceived(mailConfig.companyName, inquiry);

  await Promise.all([
    mailConfig.notifyEmail
      ? send({ to: mailConfig.notifyEmail, replyTo: inquiry.email, ...staff })
      : Promise.resolve(),
    send({ to: inquiry.email, ...customer }),
  ]);
}
