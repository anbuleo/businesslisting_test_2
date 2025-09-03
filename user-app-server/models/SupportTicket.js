const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['booking', 'payment', 'technical', 'general', 'complaint'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedAgent: {
    id: String,
    name: String,
    email: String
  },
  messages: [{
    sender: {
      id: String,
      type: { type: String, enum: ['user', 'agent'] },
      name: String
    },
    content: String,
    timestamp: { type: Date, default: Date.now },
    attachments: [String]
  }],
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  resolution: {
    summary: String,
    resolvedBy: String,
    resolvedAt: Date,
    userSatisfaction: { type: Number, min: 1, max: 5 }
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes
supportTicketSchema.index({ user: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, priority: -1 });
supportTicketSchema.index({ ticketId: 1 });

// Generate ticket ID
supportTicketSchema.pre('save', function(next) {
  if (!this.ticketId) {
    this.ticketId = 'TK' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

// Add message to ticket
supportTicketSchema.methods.addMessage = function(sender, content, attachments = []) {
  this.messages.push({
    sender,
    content,
    attachments,
    timestamp: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('SupportTicket', supportTicketSchema);