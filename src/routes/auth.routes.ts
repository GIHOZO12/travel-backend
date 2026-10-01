import { Router } from 'express';

import {
  login,
  getMe,
  getAdmins,
  createAdmin,
  resendInvite,
  setPassword,
  updateAdmin,
  deleteAdmin,
} from '../controllers/auth.controller';
import protect from '../middleware/protect';
import requireAdmin from '../middleware/requireAdmin';
import validate from '../middleware/validate';
import {
  loginRules,
  createAdminRules,
  updateAdminRules,
  setPasswordRules,
  idParamRule,
} from '../validators/auth.validator';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Admin login
 *     description: 'Authenticates an admin by email and password and returns a JWT. Send that token as an Authorization Bearer header on every protected request below.'
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@travel-tour.local
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     admin:
 *                       $ref: '#/components/schemas/AdminPublic'
 *       401:
 *         description: Invalid email or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/login', loginRules, validate, login);

/**
 * @openapi
 * /auth/set-password:
 *   post:
 *     summary: Set a password using an emailed invite link (public)
 *     description: 'No login required — the token itself (from the "Set your password" email) is the authentication. Single-use: the link stops working once used. Returns a JWT, so the person is signed in immediately.'
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password set. Signed in.
 *       400:
 *         description: The link is invalid, already used, or expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/set-password', setPasswordRules, validate, setPassword);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the currently logged-in admin
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The authenticated admin's profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AdminPublic'
 *       401:
 *         description: Missing, invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get('/me', protect, getMe);

/**
 * @openapi
 * /auth/admins:
 *   get:
 *     summary: List all staff/admin accounts (admin-only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 'Array of admin accounts, oldest first. Each includes hasPendingInvite: true if they have not yet set their own password.'
 *       401:
 *         description: Missing, invalid or expired token.
 *       403:
 *         description: Logged in, but not an administrator.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get('/admins', protect, requireAdmin, getAdmins);

/**
 * @openapi
 * /auth/admins:
 *   post:
 *     summary: Create a staff or admin account (admin-only)
 *     description: 'Requires an existing ADMIN to be logged in. role defaults to STAFF when omitted. No password is collected here — the new account is emailed a "set your password" invite link instead.'
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Second Admin
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [ADMIN, STAFF]
 *                 default: STAFF
 *     responses:
 *       201:
 *         description: Admin created and invited.
 *       401:
 *         description: Missing, invalid or expired token.
 *       403:
 *         description: Logged in, but not an administrator.
 *       409:
 *         description: An admin with that email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/admins', protect, requireAdmin, createAdminRules, validate, createAdmin);

/**
 * @openapi
 * /auth/admins/{id}/resend-invite:
 *   post:
 *     summary: Resend the "set your password" invite (admin-only)
 *     description: 'Only works for accounts that have not finished setup yet (hasPendingInvite: true). Generates a new link; the old one stops working.'
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invite resent.
 *       400:
 *         description: This account is already active.
 *       401:
 *         description: Missing, invalid or expired token.
 *       403:
 *         description: Logged in, but not an administrator.
 *       404:
 *         description: No admin with that id.
 */
router.post('/admins/:id/resend-invite', protect, requireAdmin, idParamRule, validate, resendInvite);

/**
 * @openapi
 * /auth/admins/{id}:
 *   put:
 *     summary: Change a staff member's role (admin-only)
 *     description: 'You cannot change your own role, and the last remaining ADMIN cannot be demoted.'
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, STAFF]
 *     responses:
 *       200:
 *         description: Updated admin.
 *       400:
 *         description: Tried to change your own role, or demote the last admin.
 *       401:
 *         description: Missing, invalid or expired token.
 *       403:
 *         description: Logged in, but not an administrator.
 *       404:
 *         description: No admin with that id.
 */
router.put('/admins/:id', protect, requireAdmin, updateAdminRules, validate, updateAdmin);

/**
 * @openapi
 * /auth/admins/{id}:
 *   delete:
 *     summary: Remove a staff/admin account (admin-only)
 *     description: 'You cannot delete your own account, and the last remaining ADMIN cannot be deleted.'
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin deleted.
 *       400:
 *         description: Tried to delete your own account, or the last admin.
 *       401:
 *         description: Missing, invalid or expired token.
 *       403:
 *         description: Logged in, but not an administrator.
 *       404:
 *         description: No admin with that id.
 */
router.delete('/admins/:id', protect, requireAdmin, idParamRule, validate, deleteAdmin);

export default router;
