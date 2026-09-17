import { Router } from 'express';

import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
} from '../controllers/inquiry.controller';
import protect from '../middleware/protect';
import validate from '../middleware/validate';
import {
  idParamRule,
  createInquiryRules,
  updateInquiryRules,
} from '../validators/inquiry.validator';

const router = Router();

/**
 * @openapi
 * /inquiries:
 *   post:
 *     summary: Submit a tour inquiry (public — no login required)
 *     description: 'The lightweight "expression of interest" form. tourId is optional — a visitor can be browsing a destination generally rather than one specific tour.'
 *     tags: [Inquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email]
 *             properties:
 *               fullName: { type: string, example: Alice Traveler }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               destinationName:
 *                 type: string
 *                 description: 'Free-text fallback when no specific tour was selected.'
 *               tourId:
 *                 type: integer
 *                 description: 'Optional. If provided, must reference an existing tour.'
 *               preferredDate: { type: string, format: date }
 *               numberOfTravelers: { type: integer }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Inquiry received.
 *       400:
 *         description: 'Validation failed, e.g. tourId does not exist.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/', createInquiryRules, validate, createInquiry);

/**
 * @openapi
 * /inquiries:
 *   get:
 *     summary: List inquiries (admin-only)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, CLOSED]
 *         description: Optional filter.
 *     responses:
 *       200:
 *         description: Array of inquiries, newest first.
 *       401:
 *         description: Missing, invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get('/', protect, getInquiries);

/**
 * @openapi
 * /inquiries/{id}:
 *   get:
 *     summary: Get one inquiry by id (admin-only)
 *     tags: [Inquiries]
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
 *         description: The inquiry.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No inquiry with that id.
 */
router.get('/:id', protect, idParamRule, validate, getInquiryById);

/**
 * @openapi
 * /inquiries/{id}:
 *   put:
 *     summary: Update an inquiry — mainly its status (admin-only)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, CONTACTED, CLOSED]
 *     responses:
 *       200:
 *         description: Updated inquiry.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No inquiry with that id.
 */
router.put('/:id', protect, updateInquiryRules, validate, updateInquiry);

/**
 * @openapi
 * /inquiries/{id}:
 *   delete:
 *     summary: Delete an inquiry — e.g. spam cleanup (admin-only)
 *     tags: [Inquiries]
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
 *         description: Inquiry deleted.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No inquiry with that id.
 */
router.delete('/:id', protect, idParamRule, validate, deleteInquiry);

export default router;
