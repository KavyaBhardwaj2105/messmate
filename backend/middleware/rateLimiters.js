const rateLimit = require('express-rate-limit');

// Generous general-purpose limiter for the whole API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this device. Please try again in a few minutes.',
  },
});

// Tighter limiter specifically for login/signup to slow down brute-force
// and credential-stuffing attempts against user accounts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login/signup attempts. Please wait a few minutes and try again.',
  },
});

// Stricter limiter for write operations (create/update/delete)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many changes submitted recently. Please slow down and try again shortly.',
  },
});

module.exports = { apiLimiter, authLimiter, writeLimiter };
