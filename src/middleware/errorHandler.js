const { Prisma } = require('@prisma/client');

// Central error handler — every asyncHandler-wrapped controller that
// throws (including thrown ApiError) ends up here via next(err).
// Express recognizes this as error middleware because it takes 4 args.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.statusCode ? err.message : 'Something went wrong. Please try again later.';
  const details = err.details;

  // Translate common Prisma error codes into friendlier API responses
  // instead of leaking raw database error text to clients (SRS §74).
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (err.code === 'P2003') {
      statusCode = 409;
      message = 'This record is referenced by other data and cannot be modified or deleted';
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

module.exports = errorHandler;
