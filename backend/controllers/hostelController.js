const mongoose = require('mongoose');
const Hostel = require('../models/Hostel');
const Review = require('../models/Review');
const store = require('../data/store');
const { isMongoDB } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Escapes user input before it is used to build a RegExp, preventing
// regex-injection / ReDoS from crafted search strings like "(a+)+".
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const clampInt = (value, fallback, min, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to compute stats for a hostel in Store mode
const computeStoreHostelStats = (hostelId) => {
  const reviews = store.findReviewsByHostel(hostelId);
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return {
      avgRating: 0,
      totalReviews: 0,
      ratingBreakdown: {
        5: { count: 0, percentage: 0 },
        4: { count: 0, percentage: 0 },
        3: { count: 0, percentage: 0 },
        2: { count: 0, percentage: 0 },
        1: { count: 0, percentage: 0 },
      },
      categoryRatings: { taste: 0, hygiene: 0, portionSize: 0, variety: 0 },
      topTags: [],
    };
  }

  let sumRating = 0;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let tasteSum = 0, hygieneSum = 0, portionSum = 0, varietySum = 0;
  let tasteCount = 0, hygieneCount = 0, portionCount = 0, varietyCount = 0;
  const tagCounts = {};

  reviews.forEach((rev) => {
    sumRating += rev.rating;
    const roundedStar = Math.min(5, Math.max(1, Math.round(rev.rating)));
    starCounts[roundedStar] = (starCounts[roundedStar] || 0) + 1;

    if (rev.categories) {
      if (rev.categories.taste) { tasteSum += rev.categories.taste; tasteCount++; }
      if (rev.categories.hygiene) { hygieneSum += rev.categories.hygiene; hygieneCount++; }
      if (rev.categories.portionSize) { portionSum += rev.categories.portionSize; portionCount++; }
      if (rev.categories.variety) { varietySum += rev.categories.variety; varietyCount++; }
    }

    if (Array.isArray(rev.tags)) {
      rev.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const avgRating = Number((sumRating / totalReviews).toFixed(1));

  const ratingBreakdown = {};
  [5, 4, 3, 2, 1].forEach((star) => {
    const count = starCounts[star] || 0;
    const percentage = Math.round((count / totalReviews) * 100);
    ratingBreakdown[star] = { count, percentage };
  });

  const categoryRatings = {
    taste: tasteCount > 0 ? Number((tasteSum / tasteCount).toFixed(1)) : avgRating,
    hygiene: hygieneCount > 0 ? Number((hygieneSum / hygieneCount).toFixed(1)) : avgRating,
    portionSize: portionCount > 0 ? Number((portionSum / portionCount).toFixed(1)) : avgRating,
    variety: varietyCount > 0 ? Number((varietySum / varietyCount).toFixed(1)) : avgRating,
  };

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  return { avgRating, totalReviews, ratingBreakdown, categoryRatings, topTags };
};

// @desc    Get all hostels with filters, search, sorting & aggregated ratings
// @route   GET /api/hostels
// @access  Public
const getHostels = asyncHandler(async (req, res) => {
  const { q, city, minRating, maxCost, sort = 'highest_rated' } = req.query;

  const pageNum = clampInt(req.query.page, 1, 1, 100000);
  const limitNum = clampInt(req.query.limit, 12, 1, 50);

  let hostelsList = [];

  if (isMongoDB()) {
    const filter = {};
    if (q && q.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [{ name: searchRegex }, { city: searchRegex }, { address: searchRegex }];
    }
    if (city && city.trim() !== '' && city !== 'All') {
      filter.city = new RegExp(`^${escapeRegex(city.trim())}$`, 'i');
    }
    if (maxCost && !isNaN(Number(maxCost))) {
      filter.monthlyMessCost = { $lte: Number(maxCost) };
    }

    const hostels = await Hostel.find(filter).populate('createdBy', 'name email').lean();
    const hostelIds = hostels.map((h) => h._id);

    const reviewStats = await Review.aggregate([
      { $match: { hostel: { $in: hostelIds } } },
      {
        $group: {
          _id: '$hostel',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          avgTaste: { $avg: '$categories.taste' },
          avgHygiene: { $avg: '$categories.hygiene' },
        },
      },
    ]);

    const statsMap = {};
    reviewStats.forEach((stat) => {
      statsMap[stat._id.toString()] = {
        avgRating: Number((stat.avgRating || 0).toFixed(1)),
        totalReviews: stat.totalReviews || 0,
        categoryRatings: {
          taste: Number((stat.avgTaste || stat.avgRating || 0).toFixed(1)),
          hygiene: Number((stat.avgHygiene || stat.avgRating || 0).toFixed(1)),
        },
      };
    });

    hostelsList = hostels.map((hostel) => {
      const stats = statsMap[hostel._id.toString()] || {
        avgRating: 0,
        totalReviews: 0,
        categoryRatings: { taste: 0, hygiene: 0 },
      };
      return { ...hostel, ...stats };
    });
  } else {
    let rawHostels = store.getHostels();

    if (q && q.trim() !== '') {
      const queryLower = q.toLowerCase().trim();
      rawHostels = rawHostels.filter(
        (h) =>
          h.name?.toLowerCase().includes(queryLower) ||
          h.city?.toLowerCase().includes(queryLower) ||
          h.address?.toLowerCase().includes(queryLower)
      );
    }

    if (city && city.trim() !== '' && city !== 'All') {
      rawHostels = rawHostels.filter((h) => h.city?.toLowerCase() === city.toLowerCase().trim());
    }

    if (maxCost && !isNaN(Number(maxCost))) {
      rawHostels = rawHostels.filter((h) => Number(h.monthlyMessCost) <= Number(maxCost));
    }

    hostelsList = rawHostels.map((h) => {
      const stats = computeStoreHostelStats(h._id);
      const creator = store.findUserById(h.createdBy);
      return {
        ...h,
        createdBy: creator ? { _id: creator._id, name: creator.name, email: creator.email } : null,
        avgRating: stats.avgRating,
        totalReviews: stats.totalReviews,
        categoryRatings: stats.categoryRatings,
      };
    });
  }

  if (minRating && !isNaN(Number(minRating)) && Number(minRating) > 0) {
    hostelsList = hostelsList.filter((h) => h.avgRating >= Number(minRating));
  }

  if (sort === 'highest_rated') {
    hostelsList.sort((a, b) => b.avgRating - a.avgRating || b.totalReviews - a.totalReviews);
  } else if (sort === 'most_reviewed') {
    hostelsList.sort((a, b) => b.totalReviews - a.totalReviews || b.avgRating - a.avgRating);
  } else if (sort === 'lowest_cost') {
    hostelsList.sort((a, b) => Number(a.monthlyMessCost) - Number(b.monthlyMessCost));
  } else if (sort === 'highest_cost') {
    hostelsList.sort((a, b) => Number(b.monthlyMessCost) - Number(a.monthlyMessCost));
  } else if (sort === 'newest') {
    hostelsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalCount = hostelsList.length;
  const totalPages = Math.ceil(totalCount / limitNum) || 1;
  const safePage = Math.min(pageNum, totalPages);
  const paginated = hostelsList.slice((safePage - 1) * limitNum, safePage * limitNum);

  return res.status(200).json({
    success: true,
    count: paginated.length,
    totalCount,
    totalPages,
    currentPage: safePage,
    hostels: paginated,
  });
});

// @desc    Get single hostel by ID
// @route   GET /api/hostels/:id
// @access  Public
const getMongoHostelStats = async (hostelId) => {
  const rows = await Review.aggregate([
    { $match: { hostel: hostelId } },
    {
      $group: {
        _id: '$hostel',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        avgTaste: { $avg: '$categories.taste' },
        avgHygiene: { $avg: '$categories.hygiene' },
        avgPortionSize: { $avg: '$categories.portionSize' },
        avgVariety: { $avg: '$categories.variety' },
      },
    },
  ]);
  const stats = rows[0];
  if (!stats) {
    return { avgRating: 0, totalReviews: 0, ratingBreakdown: { 5:{count:0,percentage:0},4:{count:0,percentage:0},3:{count:0,percentage:0},2:{count:0,percentage:0},1:{count:0,percentage:0} }, categoryRatings: { taste:0, hygiene:0, portionSize:0, variety:0 }, topTags: [] };
  }

  const reviews = await Review.find({ hostel: hostelId }).select('rating categories tags').lean();
  const totalReviews = stats.totalReviews || 0;
  const counts = { 5:0, 4:0, 3:0, 2:0, 1:0 };
  const tags = {};
  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(Number(review.rating) || 0)));
    if (star) counts[star] += 1;
    for (const tag of (Array.isArray(review.tags) ? review.tags : [])) tags[tag] = (tags[tag] || 0) + 1;
  }
  const ratingBreakdown = {};
  for (const star of [5,4,3,2,1]) ratingBreakdown[star] = { count: counts[star], percentage: totalReviews ? Math.round(counts[star] / totalReviews * 100) : 0 };
  const avg = Number((stats.avgRating || 0).toFixed(1));
  return {
    avgRating: avg,
    totalReviews,
    ratingBreakdown,
    categoryRatings: {
      taste: Number((stats.avgTaste ?? avg).toFixed(1)),
      hygiene: Number((stats.avgHygiene ?? avg).toFixed(1)),
      portionSize: Number((stats.avgPortionSize ?? avg).toFixed(1)),
      variety: Number((stats.avgVariety ?? avg).toFixed(1)),
    },
    topTags: Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,count])=>({name,count})),
  };
};

const getHostelById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isMongoDB()) {
    if (!isValidObjectId(id)) throw new AppError('Hostel not found.', 404);

    const hostel = await Hostel.findById(id).populate('createdBy', 'name email');
    if (!hostel) throw new AppError('Hostel not found.', 404);

    const stats = await getMongoHostelStats(hostel._id);

    return res.status(200).json({
      success: true,
      hostel: { ...hostel.toObject(), ...stats },
    });
  }

  const hostel = store.findHostelById(id);
  if (!hostel) throw new AppError('Hostel not found.', 404);

  const creator = store.findUserById(hostel.createdBy);
  const stats = computeStoreHostelStats(hostel._id);

  return res.status(200).json({
    success: true,
    hostel: {
      ...hostel,
      createdBy: creator ? { _id: creator._id, name: creator.name, email: creator.email } : null,
      ...stats,
    },
  });
});

// @desc    Create new hostel
// @route   POST /api/hostels
// @access  Private
const createHostel = asyncHandler(async (req, res) => {
  const { name, city, monthlyMessCost, description, address, foodAvailability, images } = req.body;

  const payload = {
    name: name.trim(),
    city: city.trim(),
    monthlyMessCost: Number(monthlyMessCost),
    description: description ? description.trim() : '',
    address: address ? address.trim() : '',
    foodAvailability: foodAvailability ? foodAvailability.trim() : '3 Meals / Day',
    images: Array.isArray(images) ? images.slice(0, 8) : [],
  };

  if (isMongoDB()) {
    const hostel = await Hostel.create({ ...payload, createdBy: req.user._id });
    const populated = await Hostel.findById(hostel._id).populate('createdBy', 'name email');
    return res.status(201).json({
      success: true,
      message: 'Hostel added successfully!',
      hostel: { ...populated.toObject(), avgRating: 0, totalReviews: 0 },
    });
  }

  const hostel = store.createHostel({ ...payload, createdBy: req.user._id });
  return res.status(201).json({
    success: true,
    message: 'Hostel added successfully!',
    hostel: {
      ...hostel,
      createdBy: { _id: req.user._id, name: req.user.name, email: req.user.email },
      avgRating: 0,
      totalReviews: 0,
    },
  });
});

// @desc    Update hostel details
// @route   PUT /api/hostels/:id
// @access  Private (creator only)
const updateHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, city, monthlyMessCost, description, address, foodAvailability, images } = req.body;

  if (isMongoDB()) {
    if (!isValidObjectId(id)) throw new AppError('Hostel not found.', 404);

    const hostel = await Hostel.findById(id);
    if (!hostel) throw new AppError('Hostel not found.', 404);

    if (hostel.createdBy.toString() !== req.user._id.toString()) {
      throw new AppError('You are not authorized to edit this hostel.', 403);
    }

    if (name) hostel.name = name.trim();
    if (city) hostel.city = city.trim();
    if (monthlyMessCost !== undefined) hostel.monthlyMessCost = Number(monthlyMessCost);
    if (description !== undefined) hostel.description = description.trim();
    if (address !== undefined) hostel.address = address.trim();
    if (foodAvailability !== undefined) hostel.foodAvailability = foodAvailability.trim();
    if (Array.isArray(images)) hostel.images = images.slice(0, 8);

    await hostel.save();
    const updated = await Hostel.findById(hostel._id).populate('createdBy', 'name email');
    return res.status(200).json({ success: true, message: 'Hostel updated successfully!', hostel: updated });
  }

  const hostel = store.findHostelById(id);
  if (!hostel) throw new AppError('Hostel not found.', 404);

  if (hostel.createdBy.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to edit this hostel.', 403);
  }

  const updated = store.updateHostel(id, {
    ...(name && { name: name.trim() }),
    ...(city && { city: city.trim() }),
    ...(monthlyMessCost !== undefined && { monthlyMessCost: Number(monthlyMessCost) }),
    ...(description !== undefined && { description: description.trim() }),
    ...(address !== undefined && { address: address.trim() }),
    ...(foodAvailability !== undefined && { foodAvailability: foodAvailability.trim() }),
    ...(Array.isArray(images) && { images: images.slice(0, 8) }),
  });

  return res.status(200).json({
    success: true,
    message: 'Hostel updated successfully!',
    hostel: { ...updated, createdBy: { _id: req.user._id, name: req.user.name, email: req.user.email } },
  });
});

// @desc    Delete hostel
// @route   DELETE /api/hostels/:id
// @access  Private (creator only)
const deleteHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isMongoDB()) {
    if (!isValidObjectId(id)) throw new AppError('Hostel not found.', 404);

    const hostel = await Hostel.findById(id);
    if (!hostel) throw new AppError('Hostel not found.', 404);

    if (hostel.createdBy.toString() !== req.user._id.toString()) {
      throw new AppError('You are not authorized to delete this hostel.', 403);
    }

    await Review.deleteMany({ hostel: hostel._id });
    await hostel.deleteOne();
    return res.status(200).json({ success: true, message: 'Hostel deleted successfully.' });
  }

  const hostel = store.findHostelById(id);
  if (!hostel) throw new AppError('Hostel not found.', 404);

  if (hostel.createdBy.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to delete this hostel.', 403);
  }

  store.deleteHostel(id);
  return res.status(200).json({ success: true, message: 'Hostel deleted successfully.' });
});

// @desc    Get cities meta
// @route   GET /api/hostels/meta/cities
// @access  Public
const getCities = asyncHandler(async (req, res) => {
  if (isMongoDB()) {
    const cities = await Hostel.distinct('city');
    return res.status(200).json({ success: true, cities: cities.filter(Boolean).sort() });
  }

  const all = store.getHostels();
  const cities = [...new Set(all.map((h) => h.city).filter(Boolean))].sort();
  return res.status(200).json({ success: true, cities });
});

// @desc    Get hostels created by current user
// @route   GET /api/hostels/user/me
// @access  Private
const getMyHostels = asyncHandler(async (req, res) => {
  if (isMongoDB()) {
    const hostels = await Hostel.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(hostels.map(async (h) => ({ ...h, ...(await getMongoHostelStats(h._id)) })));
    return res.status(200).json({ success: true, hostels: enriched });
  }

  const myHostels = store.getHostels().filter((h) => h.createdBy === req.user._id);
  const enriched = myHostels.map((h) => ({ ...h, ...computeStoreHostelStats(h._id) }));
  return res.status(200).json({ success: true, hostels: enriched });
});

module.exports = {
  getHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  getCities,
  getMyHostels,
  isValidObjectId,
};
