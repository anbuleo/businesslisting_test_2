const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null // Only for booking-related transactions
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'refund', 'penalty'],
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
    default: 'pending'
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    bankAccount: String,
    transactionId: String,
    processingFee: Number,
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
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ employeeId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ bookingId: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toFixed(2)}`;
});

// Method to get transaction summary
transactionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    amount: this.amount,
    formattedAmount: this.formattedAmount,
    status: this.status,
    description: this.description,
    date: this.createdAt,
    balanceAfter: this.balanceAfter
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);