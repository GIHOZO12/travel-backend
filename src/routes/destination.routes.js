const express = require('express');
const router = express.Router();

const {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../controllers/destination.controller');
const validate = require('../middleware/validate');
const {
  idParamRule,
  createDestinationRules,
  updateDestinationRules,
} = require('../validators/destination.validator');

// Public reads
router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);

// Writes — NOT auth-protected yet. In Phase 4 we'll add a `protect`
// middleware here (JWT check) so only a logged-in admin can reach these.
router.post('/', createDestinationRules, validate, createDestination);
router.put('/:id', updateDestinationRules, validate, updateDestination);
router.delete('/:id', idParamRule, validate, deleteDestination);

module.exports = router;
