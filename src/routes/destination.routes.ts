import { Router } from 'express';

import {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destination.controller';
import protect from '../middleware/protect';
import validate from '../middleware/validate';
import {
  idParamRule,
  createDestinationRules,
  updateDestinationRules,
} from '../validators/destination.validator';

const router = Router();

/**
 * @openapi
 * /destinations:
 *   get:
 *     summary: List published destinations
 *     tags: [Destinations]
 *     responses:
 *       200:
 *         description: Array of published destinations, newest first.
 */
router.get('/', getDestinations);

/**
 * @openapi
 * /destinations/{slug}:
 *   get:
 *     summary: Get a destination by slug, including its published tours
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: rwanda
 *     responses:
 *       200:
 *         description: The destination and its published tours.
 *       404:
 *         description: No destination with that slug.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get('/:slug', getDestinationBySlug);

/**
 * @openapi
 * /destinations:
 *   post:
 *     summary: Create a destination
 *     tags: [Destinations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, country, overview]
 *             properties:
 *               name: { type: string, example: Rwanda }
 *               country: { type: string, example: Rwanda }
 *               overview: { type: string }
 *               attractions: { type: array, items: { type: string } }
 *               activities: { type: array, items: { type: string } }
 *               bestTimeToVisit: { type: string }
 *               heroImage: { type: string }
 *               images: { type: array, items: { type: string } }
 *               isFeatured: { type: boolean }
 *               isPublished: { type: boolean }
 *     responses:
 *       201:
 *         description: Destination created.
 *       401:
 *         description: Missing, invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       409:
 *         description: A destination with that name/slug already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/', protect, createDestinationRules, validate, createDestination);

/**
 * @openapi
 * /destinations/{id}:
 *   put:
 *     summary: Update a destination
 *     tags: [Destinations]
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
 *             description: Any subset of the create fields — only sent fields are changed.
 *     responses:
 *       200:
 *         description: Updated destination.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No destination with that id.
 */
router.put('/:id', protect, updateDestinationRules, validate, updateDestination);

/**
 * @openapi
 * /destinations/{id}:
 *   delete:
 *     summary: Delete a destination
 *     tags: [Destinations]
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
 *         description: Destination deleted.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No destination with that id.
 *       409:
 *         description: 'This destination still has tours referencing it and cannot be deleted.'
 */
router.delete('/:id', protect, idParamRule, validate, deleteDestination);

export default router;
