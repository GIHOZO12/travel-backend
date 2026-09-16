const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Pairs with express-validator rule arrays (see src/validators/*).
// Each route runs: [...rules, validate, controllerFn]
// If any rule failed, we short-circuit with a 400 before touching the DB.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', errors.array()));
  }
  next();
}

module.exports = validate;
