import { Router } from 'express';

import { login, getMe, getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../controllers/auth.controller';
import protect from '../middleware/protect';
import requireAdmin from '../middleware/requireAdmin';
import validate from '../middleware/validate';
import { loginRules, createAdminRules, updateAdminRules, idParamRule } from '../validators/auth.validator';

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
 *         description: Array of admin accounts, oldest first.
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
 *     description: 'Requires an existing ADMIN to be logged in. role defaults to STAFF when omitted.'
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Second Admin
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [ADMIN, STAFF]
 *                 default: STAFF
 *     responses:
 *       201:
 *         description: Admin created.
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
