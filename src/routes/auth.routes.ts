import { Router } from 'express';

import { login, getMe, createAdmin } from '../controllers/auth.controller';
import protect from '../middleware/protect';
import validate from '../middleware/validate';
import { loginRules, createAdminRules } from '../validators/auth.validator';

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
 *   post:
 *     summary: Create another admin account
 *     description: Requires an existing admin to be logged in — there is no public self-registration endpoint by design.
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
 *     responses:
 *       201:
 *         description: Admin created.
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
 *       409:
 *         description: An admin with that email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/admins', protect, createAdminRules, validate, createAdmin);

export default router;
