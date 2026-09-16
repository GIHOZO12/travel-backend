// Express doesn't automatically catch rejected promises from async route
// handlers. Wrapping a handler in asyncHandler means any thrown error (or
// rejected await) is forwarded to next(err) -> our error-handling
// middleware, instead of crashing the process or hanging the request.
//
// Without this you'd write try/catch in every single controller function.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
