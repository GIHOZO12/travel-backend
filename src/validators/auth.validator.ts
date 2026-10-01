import { body, param } from 'express-validator';

const idParamRule = param('id').isInt().withMessage('Invalid admin id').toInt();

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Rules for POST /api/auth/admins — creating a staff or admin account. No
// password is collected here — the new person sets their own via the
// emailed invite link (see the "set your own password" flow). Only
// reachable by an already-logged-in ADMIN (see requireAdmin in
// auth.routes.ts). `role` defaults to STAFF in the controller when omitted —
// creating a fellow full ADMIN must be a deliberate, explicit choice.
const createAdminRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('role').optional().isIn(['ADMIN', 'STAFF']).withMessage('role must be ADMIN or STAFF'),
];

// Rules for PUT /api/auth/admins/:id — admin-only. Currently only the role
// can be changed here; renaming/re-emailing an account isn't exposed yet.
const updateAdminRules = [
  idParamRule,
  body('role').notEmpty().withMessage('role is required').isIn(['ADMIN', 'STAFF']).withMessage('role must be ADMIN or STAFF'),
];

// Rules for POST /api/auth/set-password — PUBLIC. The token itself is the
// authentication (see setPassword in auth.controller.ts), so no login is
// required to call this.
const setPasswordRules = [
  body('token').trim().notEmpty().withMessage('token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

export { idParamRule, loginRules, createAdminRules, updateAdminRules, setPasswordRules };
