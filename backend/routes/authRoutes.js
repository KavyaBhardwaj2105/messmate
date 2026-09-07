const express = require('express');
const router = express.Router();
const { signup, login, refresh, logout, verifyEmail, resendVerification, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');
const { signupRules, loginRules, validate } = require('../middleware/validators');
const { sameOrigin } = require('../middleware/csrf');

router.post('/signup', authLimiter, signupRules, validate, signup);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/refresh', sameOrigin, authLimiter, refresh);
router.post('/logout', sameOrigin, logout);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, bodyPasswordRules, validate, resetPassword);
router.get('/me', protect, getMe);

function bodyPasswordRules(req, res, next) {
  const password = req.body?.password;
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) return res.status(422).json({ success: false, message: 'Password must be between 8 and 72 characters.' });
  if (!req.body?.token) return res.status(422).json({ success: false, message: 'Reset token is required.' });
  next();
}

module.exports = router;
