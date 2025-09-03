const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  serviceTypes: [{
    type: String,
    enum: ['plumbing', 'electrical', 'cleaning', 'repair', 'maintenance', 'other']
  }],
  assignedBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  lastLocationUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
employeeSchema.index({ location: '2dsphere' });
employeeSchema.index({ availabilityStatus: 1 });
employeeSchema.index({ serviceTypes: 1 });

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update location method
employeeSchema.methods.updateLocation = function(longitude, latitude) {
  this.location.coordinates = [longitude, latitude];
  this.lastLocationUpdate = new Date();
  return this.save();
};

// Get nearby employees static method
employeeSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000, serviceType = null) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    availabilityStatus: 'available'
  };

  if (serviceType) {
    query.serviceTypes = serviceType;
  }

  return this.find(query).select('-password');
};

module.exports = mongoose.model('Employee', employeeSchema);