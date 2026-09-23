import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';

// Runs AFTER `protect` (which guarantees req.user is set). `protect` only
// checks "is this a valid, logged-in account" — this checks "is that account
// allowed to do THIS". STAFF accounts can only manage bookings/inquiries;
// everything else (content, uploads, other accounts) requires ADMIN.
//   router.post('/', protect, requireAdmin, createXRules, validate, createX);
const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    next(new ApiError(403, 'Forbidden — this action requires an administrator account'));
    return;
  }
  next();
};

export default requireAdmin;
