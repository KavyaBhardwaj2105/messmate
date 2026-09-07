const { body, query, validationResult } = require('express-validator');

/**
 * Runs after any validation chain array below.
 * Collects all validation errors and returns a single, consistent
 * 422 response instead of letting bad data reach the controllers/DB.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
};

// ---------- Auth ----------
const signupRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email is too long.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters.'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.').isLength({ max: 72 }).withMessage('Invalid password.'),
];

// ---------- Hostels ----------
const hostelCreateRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Hostel / PG name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Hostel name must be between 2 and 100 characters.'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required.')
    .isLength({ min: 2, max: 60 })
    .withMessage('City must be between 2 and 60 characters.'),
  body('monthlyMessCost')
    .notEmpty()
    .withMessage('Monthly mess cost is required.')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Monthly mess cost must be a positive number.'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 250 }).withMessage('Address cannot exceed 250 characters.'),
  body('foodAvailability').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Food availability text is too long.'),
  body('images').optional().isArray({ max: 8 }).withMessage('You can add up to 8 hostel photos.'),
  body('images.*.url').optional().isURL({ protocols: ['http','https'] }).withMessage('Invalid image URL.'),
];

const hostelUpdateRules = [
  body('name').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 100 }).withMessage('Hostel name must be between 2 and 100 characters.'),
  body('city').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 60 }).withMessage('City must be between 2 and 60 characters.'),
  body('monthlyMessCost').optional().isFloat({ min: 0, max: 1000000 }).withMessage('Monthly mess cost must be a positive number.'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 250 }).withMessage('Address cannot exceed 250 characters.'),
  body('foodAvailability').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Food availability text is too long.'),
  body('images').optional().isArray({ max: 8 }).withMessage('You can add up to 8 hostel photos.'),
  body('images.*.url').optional().isURL({ protocols: ['http','https'] }).withMessage('Invalid image URL.'),
];

const hostelQueryRules = [
  query('page').optional().isInt({ min: 1, max: 100000 }).withMessage('Invalid page number.'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50.'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('minRating must be between 0 and 5.'),
  query('maxCost').optional().isFloat({ min: 0 }).withMessage('maxCost must be a positive number.'),
  query('q').optional().isLength({ max: 100 }).withMessage('Search query is too long.'),
  query('sort').optional().isIn(['highest_rated', 'most_reviewed', 'lowest_cost', 'highest_cost', 'newest']).withMessage('Invalid sort option.'),
];

// ---------- Reviews ----------
const reviewRules = [
  body('rating').notEmpty().withMessage('A rating is required.').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('A review comment is required.')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Comment must be between 3 and 1000 characters.'),
  body('tags').optional().isArray({ max: 15 }).withMessage('You can add up to 15 tags.'),
  body('tags.*').optional().isString().trim().isLength({ max: 30 }).withMessage('Each tag must be under 30 characters.'),
  body('categories').optional().isObject().withMessage('Categories must be an object.'),
  body('categories.taste').optional().isFloat({ min: 1, max: 5 }),
  body('categories.hygiene').optional().isFloat({ min: 1, max: 5 }),
  body('categories.portionSize').optional().isFloat({ min: 1, max: 5 }),
  body('categories.variety').optional().isFloat({ min: 1, max: 5 }),
  body('images').optional().isArray({ max: 6 }).withMessage('You can add up to 6 review photos.'),
  body('images.*.url').optional().isURL({ protocols: ['http','https'] }).withMessage('Invalid image URL.'),
];

const reviewUpdateRules = [
  body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('comment').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 1000 }).withMessage('Comment must be between 3 and 1000 characters.'),
  body('tags').optional().isArray({ max: 15 }).withMessage('You can add up to 15 tags.'),
  body('tags.*').optional().isString().trim().isLength({ max: 30 }).withMessage('Each tag must be under 30 characters.'),
  body('categories').optional().isObject().withMessage('Categories must be an object.'),
  body('categories.taste').optional().isFloat({ min: 1, max: 5 }),
  body('categories.hygiene').optional().isFloat({ min: 1, max: 5 }),
  body('categories.portionSize').optional().isFloat({ min: 1, max: 5 }),
  body('categories.variety').optional().isFloat({ min: 1, max: 5 }),
  body('images').optional().isArray({ max: 6 }).withMessage('You can add up to 6 review photos.'),
  body('images.*.url').optional().isURL({ protocols: ['http','https'] }).withMessage('Invalid image URL.'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  hostelCreateRules,
  hostelUpdateRules,
  hostelQueryRules,
  reviewRules,
  reviewUpdateRules,
};
