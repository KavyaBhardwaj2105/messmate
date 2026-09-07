const jwt = require('jsonwebtoken');
const User = require('../models/User');
const store = require('../data/store');
const { isMongoDB } = require('../config/db');

/**
 * Verifies the JWT on protected routes and attaches the authenticated
 * user to req.user. No hardcoded fallback secret is used — if
 * JWT_SECRET is missing, tokens simply cannot be verified, which is
 * safer than silently trusting a well-known default.
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided. Please log in.',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      // Server misconfiguration — do not fall back to a guessable secret.
      console.error('JWT_SECRET is not configured on the server.');
      return res.status(500).json({
        success: false,
        message: 'Server authentication is not configured correctly.',
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.type && decoded.type !== 'access') throw new Error('Invalid token type');

    let user = null;
    if (isMongoDB()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      const found = store.findUserById(decoded.id);
      if (found) {
        user = {
          _id: found._id,
          name: found.name,
          email: found.email,
          createdAt: found.createdAt,
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed. Please log in again.',
    });
  }
};

/**
 * Optional auth: attaches req.user if a valid token is present,
 * but never blocks the request if it's missing/invalid.
 * Useful for public endpoints that personalize output when logged in.
 */
const attachUserIfPresent = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return next();

    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.type && decoded.type !== 'access') throw new Error('Invalid token type');
    if (isMongoDB()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      const found = store.findUserById(decoded.id);
      if (found) {
        req.user = { _id: found._id, name: found.name, email: found.email };
      }
    }
  } catch (error) {
    // Silently ignore — this middleware never blocks the request.
  }
  return next();
};

module.exports = { protect, attachUserIfPresent };
