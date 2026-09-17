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

// Public reads
router.get('/', getTours);
router.get('/:slug', getTourBySlug);

// Writes — require a logged-in admin. `protect` runs first so an
// unauthenticated request never even reaches validation.
router.post('/', protect, createTourRules, validate, createTour);
router.put('/:id', protect, updateTourRules, validate, updateTour);
router.delete('/:id', protect, idParamRule, validate, deleteTour);

export default router;
