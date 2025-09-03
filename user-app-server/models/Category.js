const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  serviceCount: {
    type: Number,
    default: 0
  },
  averagePrice: {
    type: Number,
    default: 0
  },
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Create indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Generate slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);