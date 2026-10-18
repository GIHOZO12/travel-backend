import { mailConfig, resend, transporter } from '../config/mailer';
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
    if (resend) {
      // Resend reports a rejected email by RETURNING an error rather than
      // throwing, so it has to be checked explicitly — a try/catch alone
      // would treat every rejection as a success.
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

// Sends the "set your password" invite link — on account creation, and again
// whenever an admin clicks "Resend invite" for a still-pending account.
// `rawToken` is the plaintext token (never stored — see inviteToken.ts); this
// is the only place it exists outside of the moment it was generated.
export async function notifyStaffInvite(admin: AdminAccountEmailData, rawToken: string): Promise<void> {
  const setPasswordUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/set-password?token=${rawToken}`;
  const message = staffInvite(mailConfig.companyName, admin, setPasswordUrl, INVITE_EXPIRY_HOURS);
  await send({ to: admin.email, ...message });
}

// Tells an existing account its role just changed (promoted/demoted). See
// auth.controller.ts's updateAdmin — separate from notifyAdminAccountCreated,
// which only fires once, when the account is first made.
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
