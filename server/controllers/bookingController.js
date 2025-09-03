const Booking = require('../models/Booking');
const Employee = require('../models/Employee');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const BookingAssignmentService = require('../services/bookingAssignmentService');

// @desc    Create new booking (for testing purposes)
// @route   POST /api/bookings
// @access  Public (in real app, this would be from user app)
const createBooking = async (req, res) => {
  try {
    const {
      userId,
      serviceType,
      description,
      coordinates, // [longitude, latitude]
      address,
      scheduledTime,
      estimatedDuration,
      priority,
      customerContact
    } = req.body;

    // Validate required fields
    if (!userId || !serviceType || !description || !coordinates || !scheduledTime) {
      return res.status(400).json({ 
        message: 'Missing required fields: userId, serviceType, description, coordinates, scheduledTime' 
      });
    }

    // Validate coordinates
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Coordinates must be an array of [longitude, latitude]' });
    }

    const [longitude, latitude] = coordinates;
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({ message: 'Coordinates must be numbers' });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      serviceType,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      address,
      scheduledTime: new Date(scheduledTime),
      estimatedDuration: estimatedDuration || 60,
      priority: priority || 'medium',
      customerContact
    });

    // Automatically try to assign to nearby employee
    try {
      const assignmentResult = await BookingAssignmentService.assignBookingToNearbyEmployee(booking._id);
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          booking: await Booking.findById(booking._id).populate('assignedEmployee', '-password'),
          assignment: assignmentResult
        }
      });
    } catch (assignmentError) {
      console.error('Auto-assignment failed:', assignmentError);
      
      // Return booking even if assignment fails
      res.status(201).json({
        success: true,
        message: 'Booking created but auto-assignment failed',
        data: {
          booking: await Booking.findById(booking._id),
          assignmentError: assignmentError.message
        }
      });
    }

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      message: 'Error creating booking', 
      error: error.message 
    });
  }
};

// @desc    Accept booking
// @route   POST /api/bookings/:id/accept
// @access  Private (Employee)
const acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const employeeId = req.employee.id;

    const result = await BookingAssignmentService.handleBookingAcceptance(bookingId, employeeId);

    res.json({
      success: true,
      message: result.message,
      data: result.booking
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ 
      message: 'Error accepting booking', 
      error: error.message 
    });
  }
};

// @desc    Reject booking
// @route   POST /api/bookings/:id/reject
// @access  Private (Employee)
const rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const employeeId = req.employee.id;
    const { reason } = req.body;

    const result = await BookingAssignmentService.handleBookingRejection(bookingId, employeeId, reason);

    res.json({
      success: true,
      message: result.message,
      data: {
        rejectionProcessed: true,
        reassignmentResult: result.reassignmentResult
      }
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ 
      message: 'Error rejecting booking', 
      error: error.message 
    });
  }
};

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private (Employee)
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('assignedEmployee', '-password');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if employee is authorized to view this booking
    if (booking.assignedEmployee && booking.assignedEmployee._id.toString() !== req.employee.id) {
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

// @desc    Update booking status (start work, complete, etc.)
// @route   PUT /api/bookings/:id/status
// @access  Private (Employee)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const bookingId = req.params.id;
    const employeeId = req.employee.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if employee is authorized
    if (booking.assignedEmployee.toString() !== employeeId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Validate status transition
    const validTransitions = {
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
    };

    if (!validTransitions[booking.status] || !validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${booking.status} to ${status}` 
      });
    }

    // Update booking
    booking.status = status;
    if (notes) booking.notes = notes;

    if (status === 'completed') {
      booking.completedAt = new Date();
      
      // Process payment to employee wallet
      const employee = await Employee.findById(employeeId);
      if (employee) {
        // Get employee's wallet
        const wallet = await Wallet.findOne({ employeeId: employeeId });
        if (wallet) {
          const paymentAmount = booking.pricing?.finalCost || booking.pricing?.estimatedCost || 0;
          
          if (paymentAmount > 0) {
            // Update wallet balance
            wallet.balance += paymentAmount;
            wallet.totalEarnings += paymentAmount;
            await wallet.save();

            // Create transaction record
            await Transaction.create({
              walletId: wallet._id,
              employeeId: employeeId,
              bookingId: bookingId,
              type: 'deposit',
              amount: paymentAmount,
              status: 'completed',
              description: `Payment for ${booking.serviceType} service`,
              balanceAfter: wallet.balance
            });

            console.log(`💰 Payment of ₹${paymentAmount} added to ${employee.name}'s wallet`);
          }
        }

        // Update employee availability back to available
        employee.availabilityStatus = 'available';
        employee.totalJobs += 1;
        await employee.save();
      }
    }

    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancellationReason = notes;
      
      // Update employee availability back to available
      const employee = await Employee.findById(employeeId);
      if (employee) {
        employee.availabilityStatus = 'available';
        await employee.save();
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: await Booking.findById(bookingId).populate('assignedEmployee', '-password')
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      message: 'Error updating booking status', 
      error: error.message 
    });
  }
};

// @desc    Get assignment statistics
// @route   GET /api/bookings/stats
// @access  Private (Employee)
const getAssignmentStats = async (req, res) => {
  try {
    const stats = await BookingAssignmentService.getAssignmentStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
};

module.exports = {
  createBooking,
  acceptBooking,
  rejectBooking,
  getBooking,
  updateBookingStatus,
  getAssignmentStats
};