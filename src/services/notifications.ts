import { mailConfig, transporter } from '../config/mailer';
import {
  BookingEmailData,
  InquiryEmailData,
  customerBookingReceived,
  customerBookingStatus,
  customerInquiryReceived,
  staffNewBooking,
  staffNewInquiry,
} from './emailTemplates';

interface Message {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

// Sending an email must NEVER break the request that triggered it: a visitor's
// booking is already saved, so a mail-server hiccup is only logged.
async function send(message: Message): Promise<void> {
  if (!transporter) {
    console.log(`[email] skipped (SMTP not configured): ${message.subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: `"${mailConfig.companyName}" <${mailConfig.from}>`, ...message });
  } catch (error) {
    console.error('[email] failed to send:', error instanceof Error ? error.message : error);
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
