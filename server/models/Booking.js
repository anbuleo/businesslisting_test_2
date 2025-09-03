const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String, // For now, we'll use string. Later can be ObjectId ref to User model
    required: [true, 'User ID is required']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['plumbing', 'electrical', 'cleaning', 'repair', 'maintenance', 'other']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
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
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required']
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 60
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  rejectionHistory: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    rejectedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  assignmentHistory: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: String
  }],
  pricing: {
    estimatedCost: {
      type: Number,
      default: 0
    },
    finalCost: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  customerContact: {
    name: String,
    phone: String,
    email: String
  },
  notes: String,
  images: [String], // URLs to uploaded images
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Create indexes for efficient queries
bookingSchema.index({ location: '2dsphere' });
bookingSchema.index({ status: 1 });
bookingSchema.index({ serviceType: 1 });
bookingSchema.index({ scheduledTime: 1 });
bookingSchema.index({ assignedEmployee: 1 });
bookingSchema.index({ userId: 1 });

// Add assignment to history
bookingSchema.methods.addAssignmentHistory = function(employeeId, status = 'assigned') {
  this.assignmentHistory.push({
    employeeId,
    assignedAt: new Date(),
    status
  });
};

// Add rejection to history
bookingSchema.methods.addRejectionHistory = function(employeeId, reason = '') {
  this.rejectionHistory.push({
    employeeId,
    rejectedAt: new Date(),
    reason
  });
};

// Check if employee has rejected this booking
bookingSchema.methods.hasEmployeeRejected = function(employeeId) {
  return this.rejectionHistory.some(rejection => 
    rejection.employeeId.toString() === employeeId.toString()
  );
};

// Get rejected employee IDs
bookingSchema.methods.getRejectedEmployeeIds = function() {
  return this.rejectionHistory.map(rejection => rejection.employeeId);
};

module.exports = mongoose.model('Booking', bookingSchema);