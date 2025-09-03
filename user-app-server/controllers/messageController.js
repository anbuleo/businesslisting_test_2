const Message = require('../models/Message');
const Booking = require('../models/Booking');

// @desc    Send message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { bookingId, recipientId, recipientType, content, messageType = 'text', metadata } = req.body;

    // Validate booking exists and user has access
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is part of this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to send messages for this booking' });
    }

    // Create message
    const message = await Message.create({
      bookingId,
      sender: {
        id: req.user.id,
        type: 'user',
        name: req.user.name
      },
      recipient: {
        id: recipientId,
        type: recipientType,
        name: recipientType === 'employee' ? booking.employeeDetails?.name || 'Employee' : 'Support'
      },
      content,
      messageType,
      metadata
    });

    // Emit real-time message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`booking_${bookingId}`).emit('new_message', {
        message,
        bookingId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      message: 'Error sending message', 
      error: error.message 
    });
  }
};

// @desc    Get messages for a booking
// @route   GET /api/messages/:bookingId
// @access  Private
const getBookingMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate booking exists and user has access
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view messages for this booking' });
    }

    const messages = await Message.find({ bookingId })
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        bookingId, 
        'recipient.id': req.user.id,
        'recipient.type': 'user',
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    const total = await Message.countDocuments({ bookingId });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalMessages: total
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      message: 'Error fetching messages', 
      error: error.message 
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:bookingId/read
// @access  Private
const markMessagesAsRead = async (req, res) => {
  try {
    const { bookingId } = req.params;

    await Message.updateMany(
      { 
        bookingId, 
        'recipient.id': req.user.id,
        'recipient.type': 'user',
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ 
      message: 'Error marking messages as read', 
      error: error.message 
    });
  }
};

module.exports = {
  sendMessage,
  getBookingMessages,
  markMessagesAsRead
};