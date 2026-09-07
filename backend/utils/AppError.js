/**
 * Custom operational error class.
 * Lets controllers throw an error with a specific HTTP status code
 * and a safe, user-facing message instead of leaking internals.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes expected errors from programmer bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
