const express = require('express');
const router = express.Router();
const { updateReview, deleteReview, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimiters');
const { reviewUpdateRules, validate } = require('../middleware/validators');

// Get logged-in user's reviews
router.get('/user/me', protect, getUserReviews);

// Manage single review
router
  .route('/:id')
  .put(protect, writeLimiter, reviewUpdateRules, validate, updateReview)
  .delete(protect, writeLimiter, deleteReview);

module.exports = router;
