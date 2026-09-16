import { body, param } from 'express-validator';

const idParamRule = param('id').isInt().withMessage('Invalid destination id').toInt();

// Rules for POST /api/destinations — everything required is required.
const createDestinationRules = [
  body('name').trim().notEmpty().withMessage('Destination name is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('overview').trim().notEmpty().withMessage('Overview is required'),
  body('attractions').optional().isArray().withMessage('attractions must be an array of strings'),
  body('activities').optional().isArray().withMessage('activities must be an array of strings'),
  body('bestTimeToVisit').optional().trim(),
  body('heroImage').optional().trim(),
  body('images').optional().isArray().withMessage('images must be an array of strings'),
  body('isFeatured').optional().isBoolean(),
  body('isPublished').optional().isBoolean(),
];

// Rules for PUT /api/destinations/:id — same fields, but all optional
// since a client may only send the fields it wants to change.
const updateDestinationRules = [
  idParamRule,
  body('name').optional().trim().notEmpty().withMessage('Destination name cannot be empty'),
  body('country').optional().trim().notEmpty().withMessage('Country cannot be empty'),
  body('overview').optional().trim().notEmpty().withMessage('Overview cannot be empty'),
  body('attractions').optional().isArray(),
  body('activities').optional().isArray(),
  body('bestTimeToVisit').optional().trim(),
  body('heroImage').optional().trim(),
  body('images').optional().isArray(),
  body('isFeatured').optional().isBoolean(),
  body('isPublished').optional().isBoolean(),
];

export { idParamRule, createDestinationRules, updateDestinationRules };
