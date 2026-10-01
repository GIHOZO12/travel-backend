// Enums shared by the entities, controllers and validators. Each one matches
// a real PostgreSQL enum type (CREATE TYPE ... AS ENUM) in the database.

// ADMIN: full access — content (destinations/tours/FAQs/testimonials/blog),
// image uploads, and managing other admin/staff accounts.
// STAFF: bookings and inquiries only (view, update status) — SRS §5.4
// "Tour Operator / Staff User". Cannot touch content or other accounts.
//
// The app (and the API's JSON) uses "ADMIN"/"STAFF", but the database stores
// lowercase "admin"/"staff" — see the transformer on AdminUser.role.
export enum AdminRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export enum InquiryStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED',
}

export enum BookingStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  AWAITING_CUSTOMER = 'AWAITING_CUSTOMER',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}
