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

// Public reads
router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);

// Writes — require a logged-in admin. `protect` runs first so an
// unauthenticated request never even reaches validation.
router.post('/', protect, createDestinationRules, validate, createDestination);
router.put('/:id', protect, updateDestinationRules, validate, updateDestination);
router.delete('/:id', protect, idParamRule, validate, deleteDestination);

export default router;
