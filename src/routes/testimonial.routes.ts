import { Router } from 'express';

import {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonial.controller';
import protect from '../middleware/protect';
import validate from '../middleware/validate';
import {
  idParamRule,
  createTestimonialRules,
  updateTestimonialRules,
} from '../validators/testimonial.validator';

const router = Router();

/**
 * @openapi
 * /testimonials:
 *   get:
 *     summary: List approved testimonials
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: Array of approved testimonials, newest first.
 */
router.get('/', getTestimonials);

/**
 * @openapi
 * /testimonials/all:
 *   get:
 *     summary: List every testimonial, approved or not (admin-only)
 *     description: 'Used to review pending testimonials before approving them.'
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of all testimonials, newest first.
 *       401:
 *         description: Missing, invalid or expired token.
 */
router.get('/all', protect, getAllTestimonials);

/**
 * @openapi
 * /testimonials:
 *   post:
 *     summary: Add a testimonial (admin-only)
 *     description: 'isApproved defaults to false — set it true (here or via PUT) once reviewed, to make it appear on the public site.'
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, content]
 *             properties:
 *               customerName: { type: string, example: Jane Doe }
 *               country: { type: string, example: Canada }
 *               category: { type: string, example: Honeymoon }
 *               content: { type: string }
 *               photo: { type: string }
 *               isApproved: { type: boolean }
 *     responses:
 *       201:
 *         description: Testimonial created.
 *       401:
 *         description: Missing, invalid or expired token.
 */
router.post('/', protect, createTestimonialRules, validate, createTestimonial);

/**
 * @openapi
 * /testimonials/{id}:
 *   put:
 *     summary: Update a testimonial, or approve it (admin-only)
 *     tags: [Testimonials]
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
 *         description: Updated testimonial.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No testimonial with that id.
 */
router.put('/:id', protect, updateTestimonialRules, validate, updateTestimonial);

/**
 * @openapi
 * /testimonials/{id}:
 *   delete:
 *     summary: Delete a testimonial (admin-only)
 *     tags: [Testimonials]
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
 *         description: Testimonial deleted.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No testimonial with that id.
 */
router.delete('/:id', protect, idParamRule, validate, deleteTestimonial);

export default router;
