import { Router } from 'express';

import {
  getTours,
  getTourBySlug,
  createTour,
  updateTour,
  deleteTour,
} from '../controllers/tour.controller';
import protect from '../middleware/protect';
import validate from '../middleware/validate';
import {
  idParamRule,
  createTourRules,
  updateTourRules,
} from '../validators/tour.validator';

const router = Router();

/**
 * @openapi
 * /tours:
 *   get:
 *     summary: List published tours
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: Array of published tours, newest first, each with a destination summary.
 */
router.get('/', getTours);

/**
 * @openapi
 * /tours/{slug}:
 *   get:
 *     summary: Get a tour by slug, including its full itinerary
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: musanze-gorilla-trekking-adventure
 *     responses:
 *       200:
 *         description: The tour, its destination summary, and its itinerary days ordered by day number.
 *       404:
 *         description: No tour with that slug.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get('/:slug', getTourBySlug);

/**
 * @openapi
 * /tours:
 *   post:
 *     summary: Create a tour, optionally with its day-by-day itinerary
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, durationDays, durationNights, overview, destinationId]
 *             properties:
 *               name: { type: string, example: Musanze Gorilla Trekking Adventure }
 *               category: { type: string, example: Gorilla Trekking }
 *               durationDays: { type: integer, example: 3 }
 *               durationNights: { type: integer, example: 2 }
 *               startingPrice: { type: number, example: 1500 }
 *               currency: { type: string, example: USD }
 *               overview: { type: string }
 *               highlights: { type: array, items: { type: string } }
 *               inclusions: { type: array, items: { type: string } }
 *               exclusions: { type: array, items: { type: string } }
 *               requirements: { type: array, items: { type: string } }
 *               featuredImage: { type: string }
 *               images: { type: array, items: { type: string } }
 *               isFeatured: { type: boolean }
 *               isPublished: { type: boolean }
 *               destinationId:
 *                 type: integer
 *                 description: 'Must reference an existing destination.'
 *                 example: 2
 *               itineraryDays:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayNumber: { type: integer, example: 1 }
 *                     title: { type: string, example: Arrival in Musanze }
 *                     activities: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Tour created, with destination summary and itinerary included.
 *       400:
 *         description: 'Validation failed, e.g. destinationId does not exist.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Missing, invalid or expired token.
 *       409:
 *         description: A tour with that name/slug already exists.
 */
router.post('/', protect, createTourRules, validate, createTour);

/**
 * @openapi
 * /tours/{id}:
 *   put:
 *     summary: Update a tour's scalar fields
 *     description: 'Does not touch itineraryDays — editing the day-by-day plan is a separate concern.'
 *     tags: [Tours]
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
 *         description: Updated tour.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No tour with that id.
 */
router.put('/:id', protect, updateTourRules, validate, updateTour);

/**
 * @openapi
 * /tours/{id}:
 *   delete:
 *     summary: Delete a tour (its itinerary days cascade-delete with it)
 *     tags: [Tours]
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
 *         description: Tour deleted.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No tour with that id.
 *       409:
 *         description: 'This tour still has booking requests referencing it and cannot be deleted.'
 */
router.delete('/:id', protect, idParamRule, validate, deleteTour);

export default router;
