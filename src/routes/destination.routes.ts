import { Router } from 'express';

import {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destination.controller';
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

// Writes — NOT auth-protected yet. In Phase 4 we'll add a `protect`
// middleware here (JWT check) so only a logged-in admin can reach these.
router.post('/', createDestinationRules, validate, createDestination);
router.put('/:id', updateDestinationRules, validate, updateDestination);
router.delete('/:id', idParamRule, validate, deleteDestination);

export default router;
