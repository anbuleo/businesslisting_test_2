const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  serviceDetails: {
    name: String,
    description: String,
    basePrice: Number,
    estimatedDuration: Number
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required']
    }
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,
    country: { type: String, default: 'India' },
    landmark: String,
    instructions: String
  },
  scheduledDateTime: {
    type: Date,
    required: [true, 'Scheduled date and time is required']
  },
  timeSlot: {
    start: String, // e.g., "09:00"
    end: String    // e.g., "10:00"
  },
  status: {
    type: String,
    enum: [
      'pending',           // Just created, waiting for assignment
      'assigned',          // Assigned to employee
      'accepted',          // Employee accepted
      'in_progress',       // Work started
      'completed',         // Work completed
      'cancelled',         // Cancelled by user
      'rejected',          // Rejected by employee
      'refunded'           // Payment refunded
    ],
    default: 'pending'
  },
  assignedEmployee: {
    type: String, // Employee ID from partner app
    default: null
  },
  employeeDetails: {
    name: String,
    phone: String,
    rating: Number,
    location: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  pricing: {
    baseAmount: { type: Number, required: true },
    advanceAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  payment: {
    advance: {
      amount: Number,
      status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
      method: { type: String, enum: ['card', 'wallet', 'upi', 'netbanking'] },
      transactionId: String,
      paidAt: Date
    },
    remaining: {
      amount: Number,
      status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
      method: { type: String, enum: ['card', 'wallet', 'upi', 'netbanking', 'cash'] },
      transactionId: String,
      paidAt: Date
    }
  },
  coupon: {
    code: String,
    discountType: { type: String, enum: ['percentage', 'fixed'] },
    discountValue: Number,
    appliedAmount: Number
  },
  customerNotes: String,
  employeeNotes: String,
  rating: {
    score: { type: Number, min: 1, max: 5 },
    review: String,
    ratedAt: Date
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  cancellation: {
    reason: String,
    cancelledBy: { type: String, enum: ['user', 'employee', 'admin'] },
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] }
  }
}, {
  timestamps: true
});

// Create indexes
bookingSchema.index({ location: '2dsphere' });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ assignedEmployee: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDateTime: 1 });
bookingSchema.index({ bookingId: 1 });

// Generate booking ID
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

// Add status to timeline
bookingSchema.methods.addToTimeline = function(status, note = '') {
  this.timeline.push({
    status,
    timestamp: new Date(),
    note
  });
};

module.exports = mongoose.model('Booking', bookingSchema);