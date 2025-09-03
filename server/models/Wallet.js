const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  lastWithdrawalDate: {
    type: Date,
    default: null
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
walletSchema.index({ employeeId: 1 });

// Virtual for available withdrawal amount (balance - minimum balance)
walletSchema.virtual('availableForWithdrawal').get(function() {
  const minimumBalance = 500; // Rs 500 minimum balance
  return Math.max(0, this.balance - minimumBalance);
});

// Method to check if withdrawal is allowed today
walletSchema.methods.canWithdrawToday = function() {
  if (!this.lastWithdrawalDate) return true;
  
  const today = new Date();
  const lastWithdrawal = new Date(this.lastWithdrawalDate);
  
  // Check if last withdrawal was today
  return today.toDateString() !== lastWithdrawal.toDateString();
};

// Method to validate withdrawal amount
walletSchema.methods.validateWithdrawal = function(amount) {
  const minimumBalance = 500;
  const errors = [];
  
  if (amount <= 0) {
    errors.push('Withdrawal amount must be greater than 0');
  }
  
  if (amount > this.availableForWithdrawal) {
    errors.push(`Insufficient balance. Available for withdrawal: ₹${this.availableForWithdrawal}`);
  }
  
  if ((this.balance - amount) < minimumBalance) {
    errors.push(`Minimum balance of ₹${minimumBalance} must be maintained`);
  }
  
  if (!this.canWithdrawToday()) {
    errors.push('Only one withdrawal per day is allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = mongoose.model('Wallet', walletSchema);