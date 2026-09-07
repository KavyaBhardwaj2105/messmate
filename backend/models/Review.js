const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Hostel ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide an overall rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    categories: {
      taste: {
        type: Number,
        min: 1,
        max: 5,
        default: 4,
      },
      hygiene: {
        type: Number,
        min: 1,
        max: 5,
        default: 4,
      },
      portionSize: {
        type: Number,
        min: 1,
        max: 5,
        default: 4,
      },
      variety: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    comment: {
      type: String,
      required: [true, 'Please provide your food review comment'],
      trim: true,
      minlength: [3, 'Review comment must be at least 3 characters long'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    images: {
      type: [{ url: String, publicId: String, alt: String }],
      default: [],
      validate: { validator: (v) => v.length <= 6, message: 'A review can contain at most 6 images.' },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting multiple reviews for the same hostel
reviewSchema.index({ hostel: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
