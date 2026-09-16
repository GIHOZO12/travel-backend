import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';

// Central error handler — every asyncHandler-wrapped controller that
// throws (including thrown ApiError) ends up here via next(err).
// Express recognizes this as error middleware because it takes 4 args.
//
// `err` is typed `any` on purpose: whatever gets thrown could be an
// ApiError, a Prisma error, or a plain Error — we check its shape below
// rather than trusting a single static type.
function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = err.statusCode || 500;
  let message = err.statusCode ? err.message : 'Something went wrong. Please try again later.';
  const details = err.details;

  // Translate common Prisma error codes into friendlier API responses
  // instead of leaking raw database error text to clients (SRS §74).
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = err.meta?.target as string[] | undefined;
      message = `A record with this ${target?.join(', ') || 'value'} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (err.code === 'P2003') {
      statusCode = 409;
      message = 'This record is referenced by other data and cannot be modified or deleted';
    }
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
