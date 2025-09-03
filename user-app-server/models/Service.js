const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly', 'per_item', 'custom'],
      default: 'fixed'
    },
    advancePayment: {
      type: Number,
      default: 10, // 10% advance payment
      min: [0, 'Advance payment cannot be negative'],
      max: [100, 'Advance payment cannot exceed 100%']
    }
  },
  duration: {
    estimated: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [15, 'Minimum duration is 15 minutes']
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'minutes'
    }
  },
  availability: {
    serviceAreas: [{
      type: {
        type: String,
        enum: ['Point', 'Polygon'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // For Point: [longitude, latitude]
        required: true
      },
      radius: {
        type: Number,
        default: 10000 // 10km radius in meters
      },
      areaName: String
    }],
    workingHours: {
      monday: { start: String, end: String, available: { type: Boolean, default: true } },
      tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
      wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
      thursday: { start: String, end: String, available: { type: Boolean, default: true } },
      friday: { start: String, end: String, available: { type: Boolean, default: true } },
      saturday: { start: String, end: String, available: { type: Boolean, default: true } },
      sunday: { start: String, end: String, available: { type: Boolean, default: false } }
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  features: [String],
  requirements: [String],
  images: [String],
  tags: [String],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Create indexes
serviceSchema.index({ 'availability.serviceAreas.coordinates': '2dsphere' });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ slug: 1 });
serviceSchema.index({ 'pricing.basePrice': 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ isFeatured: -1, createdAt: -1 });
serviceSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });

// Generate slug from name
serviceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Static method to find services by location
serviceSchema.statics.findByLocation = function(longitude, latitude, maxDistance = 10000, categoryId = null) {
  const query = {
    'availability.serviceAreas.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    'availability.isAvailable': true,
    isActive: true
  };

  if (categoryId) {
    query.category = categoryId;
  }

  return this.find(query).populate('category');
};

module.exports = mongoose.model('Service', serviceSchema);