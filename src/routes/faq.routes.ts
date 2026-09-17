import { Router } from 'express';

import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '../controllers/faq.controller';
import protect from '../middleware/protect';
import validate from '../middleware/validate';
import { idParamRule, createFAQRules, updateFAQRules } from '../validators/faq.validator';

const router = Router();

/**
 * @openapi
 * /faqs:
 *   get:
 *     summary: List published FAQs, ordered for display
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: Array of published FAQs, ordered by their `order` field.
 */
router.get('/', getFAQs);

/**
 * @openapi
 * /faqs:
 *   post:
 *     summary: Create an FAQ (admin-only)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answer]
 *             properties:
 *               question: { type: string }
 *               answer: { type: string }
 *               order: { type: integer, description: 'Lower numbers display first.' }
 *               isPublished: { type: boolean }
 *     responses:
 *       201:
 *         description: FAQ created.
 *       401:
 *         description: Missing, invalid or expired token.
 */
router.post('/', protect, createFAQRules, validate, createFAQ);

/**
 * @openapi
 * /faqs/{id}:
 *   put:
 *     summary: Update an FAQ (admin-only)
 *     tags: [FAQs]
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
 *         description: Updated FAQ.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No FAQ with that id.
 */
router.put('/:id', protect, updateFAQRules, validate, updateFAQ);

/**
 * @openapi
 * /faqs/{id}:
 *   delete:
 *     summary: Delete an FAQ (admin-only)
 *     tags: [FAQs]
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
 *         description: FAQ deleted.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No FAQ with that id.
 */
router.delete('/:id', protect, idParamRule, validate, deleteFAQ);

export default router;
