import { body, param } from 'express-validator';
import { tourExistsRule } from './shared';

const idParamRule = param('id').isInt().withMessage('Invalid booking request id').toInt();

// Rules for POST /api/booking-requests (SRS §31-32). Stricter than
// Inquiry — a booking request is for one specific tour, so tourId is
// required, not optional, and matches the schema's required `phone`,
// `travelDate`, `numberOfTravelers`.
const createBookingRequestRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('nationality').optional().trim(),
  body('travelDate').notEmpty().withMessage('travelDate is required').isISO8601().withMessage('travelDate must be a valid date').toDate(),
  body('numberOfTravelers').notEmpty().withMessage('numberOfTravelers is required').isInt({ min: 1 }).withMessage('numberOfTravelers must be a positive integer').toInt(),
  body('accommodationPref').optional().trim(),
  body('specialRequests').optional().trim().isLength({ max: 2000 }).withMessage('specialRequests must be under 2000 characters'),
  tourExistsRule(body('tourId').notEmpty().withMessage('tourId is required')),
];

// Rules for PUT /api/booking-requests/:id — admin-only. Mainly used to
// progress `status` through the booking workflow (SRS §60).
const updateBookingRequestRules = [
  idParamRule,
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('nationality').optional().trim(),
  body('travelDate').optional().isISO8601().withMessage('travelDate must be a valid date').toDate(),
  body('numberOfTravelers').optional().isInt({ min: 1 }).withMessage('numberOfTravelers must be a positive integer').toInt(),
  body('accommodationPref').optional().trim(),
  body('specialRequests').optional().trim().isLength({ max: 2000 }).withMessage('specialRequests must be under 2000 characters'),
  tourExistsRule(body('tourId').optional()),
  body('status')
    .optional()
    .isIn(['NEW', 'PENDING', 'AWAITING_CUSTOMER', 'AWAITING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'])
    .withMessage('Invalid status value'),
];

export { idParamRule, createBookingRequestRules, updateBookingRequestRules };
