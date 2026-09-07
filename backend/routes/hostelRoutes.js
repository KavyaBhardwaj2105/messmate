const express = require('express');
const router = express.Router();
const {
  getHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  getCities,
  getMyHostels,
} = require('../controllers/hostelController');
const {
  getReviewsForHostel,
  createOrUpdateReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimiters');
const {
  hostelCreateRules,
  hostelUpdateRules,
  hostelQueryRules,
  reviewRules,
  validate,
} = require('../middleware/validators');

// Meta & User routes (placed before :id param so they aren't swallowed by it)
router.get('/meta/cities', getCities);
router.get('/user/me', protect, getMyHostels);

// Core Hostel routes
router
  .route('/')
  .get(hostelQueryRules, validate, getHostels)
  .post(protect, writeLimiter, hostelCreateRules, validate, createHostel);

router
  .route('/:id')
  .get(getHostelById)
  .put(protect, writeLimiter, hostelUpdateRules, validate, updateHostel)
  .delete(protect, writeLimiter, deleteHostel);

// Nested reviews for a hostel
router
  .route('/:id/reviews')
  .get(getReviewsForHostel)
  .post(protect, writeLimiter, reviewRules, validate, createOrUpdateReview);

module.exports = router;
