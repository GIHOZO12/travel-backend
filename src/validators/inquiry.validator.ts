import { body, param } from 'express-validator';
import { tourExistsRule } from './shared';

const idParamRule = param('id').isInt().withMessage('Invalid inquiry id').toInt();

// Rules for POST /api/inquiries — the lightweight "expression of interest"
// form (SRS §34). Deliberately loose: tourId is optional, since a visitor
// might just be browsing a destination generally rather than one specific
// tour (destinationName is the free-text fallback for that case).
const createInquiryRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('phone').optional().trim(),
  body('destinationName').optional().trim(),
  tourExistsRule(body('tourId').optional()),
  body('preferredDate').optional().isISO8601().withMessage('preferredDate must be a valid date').toDate(),
  body('numberOfTravelers').optional().isInt({ min: 1 }).withMessage('numberOfTravelers must be a positive integer').toInt(),
  body('message').optional().trim().isLength({ max: 2000 }).withMessage('Message must be under 2000 characters'),
];

// Rules for PUT /api/inquiries/:id — admin-only. Mainly used to change
// status, but any field can be corrected (e.g. a mistyped email).
const updateInquiryRules = [
  idParamRule,
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('phone').optional().trim(),
  body('destinationName').optional().trim(),
  tourExistsRule(body('tourId').optional()),
  body('preferredDate').optional().isISO8601().withMessage('preferredDate must be a valid date').toDate(),
  body('numberOfTravelers').optional().isInt({ min: 1 }).withMessage('numberOfTravelers must be a positive integer').toInt(),
  body('message').optional().trim().isLength({ max: 2000 }).withMessage('Message must be under 2000 characters'),
  body('status').optional().isIn(['NEW', 'CONTACTED', 'CLOSED']).withMessage('status must be one of NEW, CONTACTED, CLOSED'),
];

export { idParamRule, createInquiryRules, updateInquiryRules };
