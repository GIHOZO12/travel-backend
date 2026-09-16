import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError';

// Pairs with express-validator rule arrays (see src/validators/*).
// Each route runs: [...rules, validate, controllerFn]
// If any rule failed, we short-circuit with a 400 before touching the DB.
function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', errors.array()));
  }
  next();
}

export default validate;
