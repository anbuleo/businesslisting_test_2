const Message = require('../models/Message');
const Booking = require('../models/Booking');

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join booking room for real-time messaging
    socket.on('join_booking', async (data) => {
      try {
        const { bookingId, userId, userType } = data;
        
        // Validate booking access
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        // Check authorization
        if (userType === 'user' && booking.user.toString() !== userId) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        socket.join(`booking_${bookingId}`);
        socket.emit('joined_booking', { bookingId });
        
        console.log(`User ${userId} joined booking room: ${bookingId}`);
      } catch (error) {
        console.error('Join booking error:', error);
        socket.emit('error', { message: 'Failed to join booking room' });
      }
    });

    // Handle real-time messaging
    socket.on('send_message', async (data) => {
      try {
        const { bookingId, recipientId, recipientType, content, messageType, metadata, senderInfo } = data;

        // Create message in database
        const message = await Message.create({
          bookingId,
          sender: senderInfo,
          recipient: {
            id: recipientId,
            type: recipientType,
            name: recipientType === 'employee' ? 'Employee' : 'User'
          },
          content,
          messageType: messageType || 'text',
          metadata
        });

        // Emit to booking room
        io.to(`booking_${bookingId}`).emit('new_message', {
          message,
          bookingId
        });

        // Mark as delivered
        message.markAsDelivered();

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`booking_${data.bookingId}`).emit('user_typing', {
        userId: data.userId,
        userName: data.userName
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`booking_${data.bookingId}`).emit('user_stopped_typing', {
        userId: data.userId
      });
    });

    // Handle location sharing
    socket.on('share_location', async (data) => {
      try {
        const { bookingId, location, senderInfo } = data;

        const message = await Message.create({
          bookingId,
          sender: senderInfo,
          recipient: {
            id: data.recipientId,
            type: data.recipientType,
            name: data.recipientType === 'employee' ? 'Employee' : 'User'
          },
          content: 'Shared location',
          messageType: 'location',
          metadata: { location }
        });

        io.to(`booking_${bookingId}`).emit('new_message', {
          message,
          bookingId
        });

      } catch (error) {
        console.error('Share location error:', error);
        socket.emit('error', { message: 'Failed to share location' });
      }
    });

    // Handle voice call initiation
    socket.on('initiate_call', (data) => {
      const { bookingId, callType, callerInfo } = data;
      
      // Emit to booking room
      socket.to(`booking_${bookingId}`).emit('incoming_call', {
        bookingId,
        callType, // 'voice' or 'video'
        caller: callerInfo,
        callId: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    });

    // Handle call responses
    socket.on('call_response', (data) => {
      const { bookingId, response, callId } = data; // response: 'accept' or 'decline'
      
      socket.to(`booking_${bookingId}`).emit('call_response', {
        response,
        callId
      });
    });

    // Handle WebRTC signaling for voice calls
    socket.on('webrtc_offer', (data) => {
      socket.to(`booking_${data.bookingId}`).emit('webrtc_offer', data);
    });

    socket.on('webrtc_answer', (data) => {
      socket.to(`booking_${data.bookingId}`).emit('webrtc_answer', data);
    });

    socket.on('webrtc_ice_candidate', (data) => {
      socket.to(`booking_${data.bookingId}`).emit('webrtc_ice_candidate', data);
    });

    socket.on('call_ended', (data) => {
      socket.to(`booking_${data.bookingId}`).emit('call_ended', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = handleSocketConnection;