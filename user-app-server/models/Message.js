const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  sender: {
    id: { type: String, required: true },
    type: { type: String, enum: ['user', 'employee'], required: true },
    name: { type: String, required: true }
  },
  recipient: {
    id: { type: String, required: true },
    type: { type: String, enum: ['user', 'employee'], required: true },
    name: { type: String, required: true }
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text'
  },
  metadata: {
    imageUrl: String,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number]
    },
    systemType: String // For system messages like 'booking_accepted', 'status_updated'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ bookingId: 1, createdAt: -1 });
messageSchema.index({ 'sender.id': 1, 'sender.type': 1 });
messageSchema.index({ 'recipient.id': 1, 'recipient.type': 1 });
messageSchema.index({ isRead: 1 });

// Mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Mark message as delivered
messageSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);