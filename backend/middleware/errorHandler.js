/**
 * Centralized error handler.
 *
 * Every controller either throws an AppError (operational, safe message)
 * or lets an unexpected error bubble up via asyncHandler's next(err).
 * This is the single place that decides what the client is allowed to see.
 */
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Always log full details server-side for debugging.
  console.error(`API Error [${req.method} ${req.originalUrl}]:`, err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  // Mongoose duplicate key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry.';
    if (err.keyPattern?.email) {
      message = 'Email is already registered. Please log in or use another email.';
    } else if (err.keyPattern?.hostel && err.keyPattern?.user) {
      message = 'You have already reviewed this hostel.';
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Malformed JSON body sent by the client
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body.';
  }

  // JWT errors that slip through (defensive; auth middleware already handles most)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized. Please log in again.';
  }

  // For genuinely unexpected (non-operational) errors in production,
  // never leak internal details — return a generic message instead.
  const isKnownOperationalError = err.isOperational || statusCode < 500;
  if (isProduction && statusCode >= 500 && !isKnownOperationalError) {
    message = 'Something went wrong on our end. Please try again later.';
  }

  const response = { success: false, message };

  // Stack traces only ever go out in non-production environments.
  if (!isProduction) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
