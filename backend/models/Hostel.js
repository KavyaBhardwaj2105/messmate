const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hostel / PG name'],
      trim: true,
      maxlength: [100, 'Hostel name cannot exceed 100 characters'],
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    monthlyMessCost: {
      type: Number,
      required: [true, 'Please provide monthly mess cost'],
      min: [0, 'Monthly mess cost cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [250, 'Address cannot exceed 250 characters'],
      default: '',
    },
    foodAvailability: {
      type: String,
      trim: true,
      default: '3 Meals / Day (Breakfast, Lunch & Dinner)',
    },
    images: {
      type: [{ url: String, publicId: String, alt: String }],
      default: [],
      validate: { validator: (v) => v.length <= 8, message: 'A hostel can contain at most 8 images.' },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to populate reviews
hostelSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'hostel',
  justOne: false,
});

// Index for search optimization
hostelSchema.index({ name: 'text', city: 'text' });

module.exports = mongoose.model('Hostel', hostelSchema);
