const Review = require('../models/Review');
const Hostel = require('../models/Hostel');
const store = require('../data/store');
const { isMongoDB } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isValidObjectId } = require('./hostelController');

const clampInt = (value, fallback, min, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

// @desc    Get all reviews for a specific hostel
// @route   GET /api/hostels/:id/reviews
// @access  Public
const getReviewsForHostel = asyncHandler(async (req, res) => {
  const { id: hostelId } = req.params;
  const { sort = 'newest' } = req.query;
  const pageNum = clampInt(req.query.page, 1, 1, 100000);
  const limitNum = clampInt(req.query.limit, 10, 1, 50);

  if (isMongoDB()) {
    if (!isValidObjectId(hostelId)) throw new AppError('Hostel not found.', 404);

    const hostelExists = await Hostel.exists({ _id: hostelId });
    if (!hostelExists) throw new AppError('Hostel not found.', 404);

    let sortOption = { createdAt: -1 };
    if (sort === 'highest_rating') sortOption = { rating: -1, createdAt: -1 };
    else if (sort === 'lowest_rating') sortOption = { rating: 1, createdAt: -1 };

    const skip = (pageNum - 1) * limitNum;
    const totalReviews = await Review.countDocuments({ hostel: hostelId });
    const totalPages = Math.ceil(totalReviews / limitNum) || 1;

    const reviews = await Review.find({ hostel: hostelId })
      .populate('user', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      totalReviews,
      totalPages,
      currentPage: pageNum,
      reviews,
    });
  }

  const hostel = store.findHostelById(hostelId);
  if (!hostel) throw new AppError('Hostel not found.', 404);

  const allReviews = store.findReviewsByHostel(hostelId);
  const populated = allReviews.map((r) => {
    const u = typeof r.user === 'object' ? r.user : store.findUserById(r.user);
    return { ...r, user: u ? { _id: u._id, name: u.name } : { name: 'Student' } };
  });

  if (sort === 'highest_rating') {
    populated.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'lowest_rating') {
    populated.sort((a, b) => a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    populated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalReviews = populated.length;
  const totalPages = Math.ceil(totalReviews / limitNum) || 1;
  const paginated = populated.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.status(200).json({
    success: true,
    count: paginated.length,
    totalReviews,
    totalPages,
    currentPage: pageNum,
    reviews: paginated,
  });
});

// @desc    Create or update a food review (1 review per user per hostel)
// @route   POST /api/hostels/:id/reviews
// @access  Private
const createOrUpdateReview = asyncHandler(async (req, res) => {
  const { id: hostelId } = req.params;
  const { rating, categories, tags, comment, images } = req.body;

  if (isMongoDB()) {
    if (!isValidObjectId(hostelId)) throw new AppError('Hostel not found.', 404);

    const hostelExists = await Hostel.exists({ _id: hostelId });
    if (!hostelExists) throw new AppError('Hostel not found. It may have been removed.', 404);

    const existingReview = await Review.findOne({ hostel: hostelId, user: req.user._id });

    if (existingReview) {
      existingReview.rating = Number(rating);
      if (categories) existingReview.categories = categories;
      if (Array.isArray(tags)) existingReview.tags = tags;
      existingReview.comment = comment.trim();
      if (Array.isArray(images)) existingReview.images = images.slice(0, 6);
      await existingReview.save();

      const populated = await Review.findById(existingReview._id).populate('user', 'name');
      return res.status(200).json({
        success: true,
        message: 'Your review was updated successfully!',
        review: populated,
        isUpdated: true,
      });
    }

    const newReview = await Review.create({
      hostel: hostelId,
      user: req.user._id,
      rating: Number(rating),
      categories: categories || { taste: Number(rating), hygiene: Number(rating) },
      tags: Array.isArray(tags) ? tags : [],
      comment: comment.trim(),
      images: Array.isArray(images) ? images.slice(0, 6) : [],
    });

    const populated = await Review.findById(newReview._id).populate('user', 'name');
    return res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review: populated,
      isUpdated: false,
    });
  }

  const hostel = store.findHostelById(hostelId);
  if (!hostel) throw new AppError('Hostel not found. It may have been removed.', 404);

  const existing = store.findReviewByUserAndHostel(req.user._id, hostelId);

  if (existing) {
    const updated = store.updateReview(existing._id, {
      rating: Number(rating),
      categories: categories || existing.categories,
      tags: Array.isArray(tags) ? tags : existing.tags,
      comment: comment.trim(),
      images: Array.isArray(images) ? images.slice(0, 6) : [],
    });

    return res.status(200).json({
      success: true,
      message: 'Your review was updated successfully!',
      review: { ...updated, user: { _id: req.user._id, name: req.user.name } },
      isUpdated: true,
    });
  }

  const created = store.createReview({
    hostel: hostelId,
    user: req.user._id,
    rating: Number(rating),
    categories: categories || { taste: Number(rating), hygiene: Number(rating) },
    tags: Array.isArray(tags) ? tags : [],
    comment: comment.trim(),
  });

  return res.status(201).json({
    success: true,
    message: 'Review posted successfully! Thank you for helping fellow students.',
    review: { ...created, user: { _id: req.user._id, name: req.user.name } },
    isUpdated: false,
  });
});

// @desc    Update single review
// @route   PUT /api/reviews/:id
// @access  Private (author only)
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, categories, tags, comment, images } = req.body;

  if (isMongoDB()) {
    if (!isValidObjectId(id)) throw new AppError('Review not found.', 404);

    const review = await Review.findById(id);
    if (!review) throw new AppError('Review not found.', 404);

    if (review.user.toString() !== req.user._id.toString()) {
      throw new AppError('You are not authorized to edit this review.', 403);
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (categories) review.categories = categories;
    if (Array.isArray(tags)) review.tags = tags;
    if (comment !== undefined) review.comment = comment.trim();
    if (Array.isArray(images)) review.images = images.slice(0, 6);

    await review.save();
    const populated = await Review.findById(review._id).populate('user', 'name');
    return res.status(200).json({ success: true, message: 'Review updated successfully!', review: populated });
  }

  const review = store.findReviewById(id);
  if (!review) throw new AppError('Review not found.', 404);

  const reviewUserId = typeof review.user === 'object' ? review.user._id : review.user;
  if (reviewUserId !== req.user._id) {
    throw new AppError('You are not authorized to edit this review.', 403);
  }

  const updated = store.updateReview(id, {
    ...(rating !== undefined && { rating: Number(rating) }),
    ...(categories && { categories }),
    ...(tags && { tags }),
    ...(comment !== undefined && { comment: comment.trim() }),
    ...(Array.isArray(images) && { images: images.slice(0, 6) }),
  });

  return res.status(200).json({
    success: true,
    message: 'Review updated successfully!',
    review: { ...updated, user: { _id: req.user._id, name: req.user.name } },
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (author only)
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isMongoDB()) {
    if (!isValidObjectId(id)) throw new AppError('Review not found.', 404);

    const review = await Review.findById(id);
    if (!review) throw new AppError('Review not found.', 404);

    if (review.user.toString() !== req.user._id.toString()) {
      throw new AppError('You are not authorized to delete this review.', 403);
    }

    await review.deleteOne();
    return res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  }

  const review = store.findReviewById(id);
  if (!review) throw new AppError('Review not found.', 404);

  const reviewUserId = typeof review.user === 'object' ? review.user._id : review.user;
  if (reviewUserId !== req.user._id) {
    throw new AppError('You are not authorized to delete this review.', 403);
  }

  store.deleteReview(id);
  return res.status(200).json({ success: true, message: 'Review deleted successfully.' });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user/me
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  if (isMongoDB()) {
    const reviews = await Review.find({ user: req.user._id })
      .populate('hostel', 'name city address monthlyMessCost')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: reviews.length, reviews });
  }

  const myReviews = store.findReviewsByUser(req.user._id);
  const populated = myReviews.map((r) => {
    const h = store.findHostelById(r.hostel);
    return {
      ...r,
      hostel: h ? { _id: h._id, name: h.name, city: h.city, address: h.address, monthlyMessCost: h.monthlyMessCost } : null,
    };
  });

  return res.status(200).json({ success: true, count: populated.length, reviews: populated });
});

module.exports = {
  getReviewsForHostel,
  createOrUpdateReview,
  updateReview,
  deleteReview,
  getUserReviews,
};
