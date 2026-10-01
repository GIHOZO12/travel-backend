import { NextFunction, Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import ApiError from '../utils/ApiError';

// Central error handler — every asyncHandler-wrapped controller that
// throws (including thrown ApiError) ends up here via next(err).
// Express recognizes this as error middleware because it takes 4 args.
//
// `err` is typed `any` on purpose: whatever gets thrown could be an
// ApiError, a TypeORM/database error, or a plain Error — we check its shape
// below rather than trusting a single static type.
function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = err.statusCode || 500;
  let message = err.statusCode ? err.message : 'Something went wrong. Please try again later.';
  const details = err.details;

  // Translate common database errors into friendlier API responses instead
  // of leaking raw database error text to clients (SRS §74). TypeORM wraps
  // them in QueryFailedError; `driverError` is the original Postgres error,
  // whose `code` is a standard SQLSTATE code.
  if (err instanceof QueryFailedError) {
    const driverError = err.driverError as { code?: string; detail?: string };
    if (driverError.code === '23505') {
      // unique_violation — detail looks like: Key (email)=(a@b.com) already exists.
      statusCode = 409;
      const columns = driverError.detail?.match(/Key \(([^)]+)\)=/)?.[1]?.replace(/"/g, '');
      message = `A record with this ${columns || 'value'} already exists`;
    } else if (driverError.code === '23503') {
      // foreign_key_violation
      statusCode = 409;
      message = 'This record is referenced by other data and cannot be modified or deleted';
    }
  } else if (err instanceof EntityNotFoundError) {
    // Thrown by findOneOrFail / findOneByOrFail.
    statusCode = 404;
    message = 'Record not found';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

export default errorHandler;
