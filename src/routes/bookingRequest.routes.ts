import { Router } from 'express';

import {
  createBookingRequest,
  getBookingRequests,
  getBookingRequestById,
  updateBookingRequest,
  deleteBookingRequest,
} from '../controllers/bookingRequest.controller';
import protect from '../middleware/protect';
import validate from '../middleware/validate';
import {
  idParamRule,
  createBookingRequestRules,
  updateBookingRequestRules,
} from '../validators/bookingRequest.validator';

const router = Router();

/**
 * @openapi
 * /booking-requests:
 *   post:
 *     summary: Submit a booking request for a specific tour (public — no login required)
 *     description: 'Stricter than an Inquiry — tourId, phone, travelDate and numberOfTravelers are all required.'
 *     tags: [Booking Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone, travelDate, numberOfTravelers, tourId]
 *             properties:
 *               fullName: { type: string, example: Carol Adventurer }
 *               email: { type: string, format: email }
 *               phone: { type: string, example: '+250788111111' }
 *               nationality: { type: string, example: Canadian }
 *               travelDate: { type: string, format: date }
 *               numberOfTravelers: { type: integer, example: 2 }
 *               accommodationPref: { type: string }
 *               specialRequests: { type: string }
 *               tourId:
 *                 type: integer
 *                 description: 'Must reference an existing tour.'
 *     responses:
 *       201:
 *         description: Booking request received, status starts at NEW.
 *       400:
 *         description: 'Validation failed, e.g. tourId does not exist or a required field is missing.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/', createBookingRequestRules, validate, createBookingRequest);

/**
 * @openapi
 * /booking-requests:
 *   get:
 *     summary: List booking requests (admin-only)
 *     tags: [Booking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, PENDING, AWAITING_CUSTOMER, AWAITING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED, REJECTED]
 *         description: Optional filter.
 *     responses:
 *       200:
 *         description: Array of booking requests, newest first.
 *       401:
 *         description: Missing, invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get('/', protect, getBookingRequests);

/**
 * @openapi
 * /booking-requests/{id}:
 *   get:
 *     summary: Get one booking request by id (admin-only)
 *     tags: [Booking Requests]
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
 *         description: The booking request.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No booking request with that id.
 */
router.get('/:id', protect, idParamRule, validate, getBookingRequestById);

/**
 * @openapi
 * /booking-requests/{id}:
 *   put:
 *     summary: Update a booking request — mainly to progress its status (admin-only)
 *     description: 'Typical flow: NEW -> PENDING -> CONFIRMED -> COMPLETED, or CANCELLED/REJECTED at any point.'
 *     tags: [Booking Requests]
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
 *                 enum: [NEW, PENDING, AWAITING_CUSTOMER, AWAITING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED, REJECTED]
 *     responses:
 *       200:
 *         description: Updated booking request.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No booking request with that id.
 */
router.put('/:id', protect, updateBookingRequestRules, validate, updateBookingRequest);

/**
 * @openapi
 * /booking-requests/{id}:
 *   delete:
 *     summary: Delete a booking request — e.g. spam cleanup (admin-only)
 *     tags: [Booking Requests]
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
 *         description: Booking request deleted.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No booking request with that id.
 */
router.delete('/:id', protect, idParamRule, validate, deleteBookingRequest);

export default router;
