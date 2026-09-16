import { body, param, ValidationChain } from 'express-validator';
import prisma from '../config/prisma';

const idParamRule = param('id').isInt().withMessage('Invalid tour id').toInt();

// A tour's destinationId must point at a destination that actually exists.
// Shared between create and update since both need the same check.
const destinationExistsRule = (chain: ValidationChain): ValidationChain =>
  chain
    .isInt().withMessage('destinationId must be an integer')
    .bail()
    .custom(async (value: string) => {
      const destination = await prisma.destination.findUnique({ where: { id: Number(value) } });
      if (!destination) throw new Error('No destination exists with that id');
      return true;
    });

// Rules for POST /api/tours — everything required is required.
const createTourRules = [
  body('name').trim().notEmpty().withMessage('Tour name is required'),
  body('overview').trim().notEmpty().withMessage('Overview is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('durationDays').notEmpty().withMessage('Duration in days is required').isInt({ min: 1 }).withMessage('Duration in days must be a positive integer'),
  body('durationNights').notEmpty().withMessage('Duration in nights is required').isInt({ min: 1 }).withMessage('Duration in nights must be a positive integer'),
  destinationExistsRule(body('destinationId').notEmpty().withMessage('destinationId is required')),
  body('startingPrice').optional().isDecimal(),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('highlights').optional().isArray().withMessage('highlights must be an array of strings'),
  body('inclusions').optional().isArray().withMessage('inclusions must be an array of strings'),
  body('exclusions').optional().isArray().withMessage('exclusions must be an array of strings'),
  body('requirements').optional().isArray().withMessage('requirements must be an array of strings'),
  body('featuredImage').optional().trim(),
  body('images').optional().isArray().withMessage('images must be an array of strings'),
  body('isFeatured').optional().isBoolean(),
  body('isPublished').optional().isBoolean(),
];

// Rules for PUT /api/tours/:id — same fields, but all optional
// since a client may only send the fields it wants to change.
const updateTourRules = [
  idParamRule,
  body('name').optional().trim().notEmpty().withMessage('Tour name cannot be empty'),
  body('overview').optional().trim().notEmpty().withMessage('Overview cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('durationDays').optional().isInt({ min: 1 }).withMessage('Duration in days must be a positive integer'),
  body('durationNights').optional().isInt({ min: 1 }).withMessage('Duration in nights must be a positive integer'),
  destinationExistsRule(body('destinationId').optional()),
  body('startingPrice').optional().isDecimal(),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('highlights').optional().isArray().withMessage('highlights must be an array of strings'),
  body('inclusions').optional().isArray().withMessage('inclusions must be an array of strings'),
  body('exclusions').optional().isArray().withMessage('exclusions must be an array of strings'),
  body('requirements').optional().isArray().withMessage('requirements must be an array of strings'),
  body('featuredImage').optional().trim(),
  body('images').optional().isArray().withMessage('images must be an array of strings'),
  body('isFeatured').optional().isBoolean(),
  body('isPublished').optional().isBoolean(),
];

export { idParamRule, createTourRules, updateTourRules };
