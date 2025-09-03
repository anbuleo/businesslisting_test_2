const mongoose = require('mongoose');

const userTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null // Only for booking-related transactions
  },
  type: {
    type: String,
    enum: ['deposit', 'payment', 'refund', 'adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed' // Most user transactions are instant
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    paymentMethod: String, // e.g., 'card', 'upi', 'wallet'
    transactionId: String, // Gateway transaction ID
    failureReason: String
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
userTransactionSchema.index({ userId: 1, createdAt: -1 });
userTransactionSchema.index({ type: 1, status: 1 });
userTransactionSchema.index({ bookingId: 1 });

// Virtual for formatted amount
userTransactionSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toFixed(2)}`;
});

module.exports = mongoose.model('UserTransaction', userTransactionSchema);