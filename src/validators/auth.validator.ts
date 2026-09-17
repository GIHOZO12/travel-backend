import { body } from 'express-validator';

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Rules for POST /api/auth/admins — creating an additional admin account.
// Only reachable by an already-logged-in admin (see the `protect`
// middleware in auth.routes.ts).
const createAdminRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

export { loginRules, createAdminRules };
