// Pure functions that build the email subject + HTML. No sending happens here,
// which keeps them easy to test.
//
// SECURITY: every value that came from a visitor (name, message, ...) goes
// through esc() before it is placed in HTML, so someone typing <script> or a
// fake link into the booking form can't inject markup into staff/customer emails.

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const esc = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);

// Header values must be one line (prevents header injection).
export const oneLine = (value: unknown): string => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();

const formatDate = (value: Date | string | null | undefined): string =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

function layout(companyName: string, heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <div style="background:#18181b;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:bold;">${esc(companyName)}</div>
    <div style="padding:24px;">
      <h2 style="margin:0 0 16px;font-size:20px;">${esc(heading)}</h2>
      ${bodyHtml}
    </div>
  </div>
</body></html>`;
}

// A two-column table of label/value pairs; empty values are skipped.
function details(rows: [string, unknown][]): string {
  const cells = rows
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#71717a;vertical-align:top;white-space:nowrap;">${esc(label)}</td>` +
        `<td style="padding:6px 0;">${esc(value).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('');
  return `<table style="border-collapse:collapse;font-size:14px;">${cells}</table>`;
}

export interface BookingEmailData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  nationality?: string | null;
  travelDate: Date | string;
  numberOfTravelers: number;
  accommodationPref?: string | null;
  specialRequests?: string | null;
  status: string;
  tour: { name: string };
}

export interface InquiryEmailData {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  destinationName?: string | null;
  preferredDate?: Date | string | null;
  numberOfTravelers?: number | null;
  message?: string | null;
  tour?: { name: string } | null;
}

export function staffNewBooking(company: string, b: BookingEmailData) {
  return {
    subject: oneLine(`New booking request: ${b.tour.name} (${b.fullName})`),
    html: layout(
      company,
      'New booking request',
      details([
        ['Tour', b.tour.name],
        ['Name', b.fullName],
        ['Email', b.email],
        ['Phone', b.phone],
        ['Nationality', b.nationality],
        ['Travel date', formatDate(b.travelDate)],
        ['Travelers', b.numberOfTravelers],
        ['Accommodation', b.accommodationPref],
        ['Special requests', b.specialRequests],
      ]) + `<p style="font-size:13px;color:#71717a;">Manage it in the admin dashboard under Bookings.</p>`,
    ),
  };
}

export function customerBookingReceived(company: string, b: BookingEmailData) {
  return {
    subject: oneLine(`We received your booking request - ${company}`),
    html: layout(
      company,
      'Booking request received',
      `<p>Dear ${esc(b.fullName)},</p>
       <p>Thank you for your booking request. Our team will review it, confirm availability and contact you with the quotation and next steps.</p>` +
        details([
          ['Tour', b.tour.name],
          ['Travel date', formatDate(b.travelDate)],
          ['Travelers', b.numberOfTravelers],
        ]) +
        `<p style="margin-top:16px;">This is a request, not a confirmed booking.</p>`,
    ),
  };
}

// What to tell the customer when staff change a booking's status. Statuses
// without an entry here (NEW, PENDING, COMPLETED) don't send an email.
const STATUS_MESSAGES: Record<string, { heading: string; text: string }> = {
  CONFIRMED: {
    heading: 'Your booking is confirmed',
    text: 'Good news: your booking has been confirmed. We will send you the itinerary and any remaining details.',
  },
  AWAITING_PAYMENT: {
    heading: 'Payment required to confirm your booking',
    text: 'Your booking is almost ready. We are waiting for payment before we can confirm it. Our team will share the payment details with you.',
  },
  AWAITING_CUSTOMER: {
    heading: 'We need more information',
    text: 'We need a little more information from you to continue with your booking. Please reply to this email or contact our team.',
  },
  CANCELLED: {
    heading: 'Your booking was cancelled',
    text: 'Your booking has been cancelled. If you did not expect this, please contact our team.',
  },
  REJECTED: {
    heading: 'We could not accept your booking request',
    text: 'Unfortunately we are unable to accept this booking request. Please contact our team and we will be happy to suggest alternatives.',
  },
};

export function customerBookingStatus(company: string, b: BookingEmailData) {
  const message = STATUS_MESSAGES[b.status];
  if (!message) return null;

  return {
    subject: oneLine(`${message.heading} - ${company}`),
    html: layout(
      company,
      message.heading,
      `<p>Dear ${esc(b.fullName)},</p><p>${esc(message.text)}</p>` +
        details([
          ['Tour', b.tour.name],
          ['Travel date', formatDate(b.travelDate)],
          ['Travelers', b.numberOfTravelers],
        ]),
    ),
  };
}

export function staffNewInquiry(company: string, i: InquiryEmailData) {
  return {
    subject: oneLine(`New inquiry from ${i.fullName}`),
    html: layout(
      company,
      'New inquiry',
      details([
        ['Name', i.fullName],
        ['Email', i.email],
        ['Phone', i.phone],
        ['Tour', i.tour?.name],
        ['Destination', i.destinationName],
        ['Preferred date', formatDate(i.preferredDate)],
        ['Travelers', i.numberOfTravelers],
        ['Message', i.message],
      ]) + `<p style="font-size:13px;color:#71717a;">Manage it in the admin dashboard under Inquiries.</p>`,
    ),
  };
}

export function customerInquiryReceived(company: string, i: InquiryEmailData) {
  return {
    subject: oneLine(`We received your inquiry - ${company}`),
    html: layout(
      company,
      'Inquiry received',
      `<p>Dear ${esc(i.fullName)},</p>
       <p>Thank you for contacting us. A member of our team will review your request and contact you using the information you provided.</p>`,
    ),
  };
}
