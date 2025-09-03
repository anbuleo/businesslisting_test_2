const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const UserTransaction = require('../models/UserTransaction');
const mongoose = require('mongoose');
const axios = require('axios');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      location,
      address,
      scheduledDateTime,
      timeSlot,
      customerNotes,
      couponCode,
      paymentMethod // 'wallet' or 'online'
    } = req.body;

    // Validate service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Calculate pricing
    const baseAmount = service.pricing.basePrice;
    const advancePercentage = service.pricing.advancePayment;
    const advanceAmount = Math.round((baseAmount * advancePercentage) / 100);
    const remainingAmount = baseAmount - advanceAmount;

    // Apply coupon if provided (simplified logic)
    let discountAmount = 0;
    if (couponCode) {
      // TODO: Implement coupon validation logic
      // For now, just a simple example
      if (couponCode === 'FIRST10') {
        discountAmount = Math.round(baseAmount * 0.1); // 10% discount
      }
    }

    const totalAmount = baseAmount - discountAmount;
    const finalAdvanceAmount = Math.round((totalAmount * advancePercentage) / 100);
    const finalRemainingAmount = totalAmount - finalAdvanceAmount;

    if (paymentMethod === 'wallet' && user.wallet.balance < finalAdvanceAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance for advance payment' });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      service: serviceId,
      serviceDetails: {
        name: service.name,
        description: service.description,
        basePrice: service.pricing.basePrice,
        estimatedDuration: service.duration.estimated
      },
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      address,
      scheduledDateTime: new Date(scheduledDateTime),
      timeSlot,
      pricing: {
        baseAmount,
        advanceAmount: finalAdvanceAmount,
        remainingAmount: finalRemainingAmount,
        discountAmount,
        totalAmount
      },
      payment: {
        advance: {
          amount: finalAdvanceAmount,
          status: paymentMethod === 'wallet' ? 'completed' : 'pending', // Mark completed if paid via wallet
          method: paymentMethod
        },
        remaining: {
          amount: finalRemainingAmount,
          status: 'pending'
        }
      },
      coupon: couponCode ? {
        code: couponCode,
        discountType: 'percentage',
        discountValue: 10,
        appliedAmount: discountAmount
      } : undefined,
      customerNotes
    });

    // Add to timeline
    booking.addToTimeline('pending', 'Booking created');
    await booking.save();

    // Process advance payment if via wallet
    if (paymentMethod === 'wallet' && finalAdvanceAmount > 0) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        user.wallet.balance -= finalAdvanceAmount;
        user.totalPayments += finalAdvanceAmount;
        await user.save({ session });

        await UserTransaction.create([{
          userId: user._id,
          bookingId: booking._id,
          type: 'payment',
          amount: finalAdvanceAmount,
          status: 'completed',
          description: `Advance payment for ${service.name} booking ${booking.bookingId}`,
          metadata: { paymentMethod: 'wallet' },
          balanceAfter: user.wallet.balance
        }], { session });

        await session.commitTransaction();
        booking.payment.advance.status = 'completed';
        booking.payment.advance.paidAt = new Date();
        await booking.save();
      } catch (walletError) {
        await session.abortTransaction();
        console.error('Error processing wallet payment:', walletError);
        // You might want to revert booking creation or mark it as payment_failed
      } finally { session.endSession(); }
    }

    // Try to assign to partner app
    try {
      const assignmentResponse = await axios.post(`${process.env.PARTNER_API_URL}/api/bookings`, {
        userId: req.user.id.toString(),
        serviceType: service.category.toString(),
        description: `${service.name} - ${customerNotes || 'No additional notes'}`,
        coordinates: location.coordinates,
        address,
        scheduledTime: scheduledDateTime,
        estimatedDuration: service.duration.estimated,
        priority: 'medium',
        customerContact: {
          name: req.user.name,
          phone: req.user.phone,
          email: req.user.email
        },
        pricing: {
          estimatedCost: totalAmount,
          finalCost: totalAmount,
          currency: 'INR'
        }
      });

      console.log('✅ Booking sent to partner app:', assignmentResponse.data);
    } catch (partnerError) {
      console.error('❌ Failed to send booking to partner app:', partnerError.message);
    }

    // Populate and return
    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'name description pricing')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      message: 'Error creating booking', 
      error: error.message 
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'name description pricing category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ 
      message: 'Error fetching bookings', 
      error: error.message 
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name description pricing category')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      message: 'Error fetching booking', 
      error: error.message 
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (!['pending', 'assigned', 'accepted'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled at this stage' });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      reason: reason || 'Cancelled by user',
      cancelledBy: 'user',
      cancelledAt: new Date()
    };

    booking.addToTimeline('cancelled', reason || 'Cancelled by user');
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      message: 'Error cancelling booking', 
      error: error.message 
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
};