import { body, param } from 'express-validator';

const idParamRule = param('id').isInt().withMessage('Invalid FAQ id').toInt();

const createFAQRules = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  body('order').optional().isInt().withMessage('order must be an integer').toInt(),
  body('isPublished').optional().isBoolean(),
];

const updateFAQRules = [
  idParamRule,
  body('question').optional().trim().notEmpty().withMessage('Question cannot be empty'),
  body('answer').optional().trim().notEmpty().withMessage('Answer cannot be empty'),
  body('order').optional().isInt().withMessage('order must be an integer').toInt(),
  body('isPublished').optional().isBoolean(),
];

export { idParamRule, createFAQRules, updateFAQRules };
