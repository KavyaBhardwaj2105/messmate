/**
 * Wraps an async route/controller function so any rejected promise or
 * thrown error is automatically forwarded to Express's error handler
 * via next(). Removes the need for repetitive try/catch blocks and
 * guarantees no unhandled promise rejection ever crashes the server.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
