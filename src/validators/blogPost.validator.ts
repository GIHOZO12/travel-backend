import { body, param } from 'express-validator';

const idParamRule = param('id').isInt().withMessage('Invalid blog post id').toInt();

const createBlogPostRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('featuredImage').optional().trim(),
  body('author').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray().withMessage('tags must be an array of strings'),
  body('isPublished').optional().isBoolean(),
];

const updateBlogPostRules = [
  idParamRule,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('featuredImage').optional().trim(),
  body('author').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray().withMessage('tags must be an array of strings'),
  body('isPublished').optional().isBoolean(),
];

export { idParamRule, createBlogPostRules, updateBlogPostRules };
