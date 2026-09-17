import { body, param } from 'express-validator';

const idParamRule = param('id').isInt().withMessage('Invalid testimonial id').toInt();

// Testimonials are admin-entered (not a public submission form — SRS §46
// doesn't describe one), so `isApproved` defaults to false: an admin adds
// one, reviews it, then flips it to true to make it appear on the site.
const createTestimonialRules = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('content').trim().notEmpty().withMessage('Testimonial content is required'),
  body('country').optional().trim(),
  body('category').optional().trim(),
  body('photo').optional().trim(),
  body('isApproved').optional().isBoolean(),
];

const updateTestimonialRules = [
  idParamRule,
  body('customerName').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Testimonial content cannot be empty'),
  body('country').optional().trim(),
  body('category').optional().trim(),
  body('photo').optional().trim(),
  body('isApproved').optional().isBoolean(),
];

export { idParamRule, createTestimonialRules, updateTestimonialRules };
