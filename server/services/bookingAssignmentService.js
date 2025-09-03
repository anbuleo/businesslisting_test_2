const Booking = require('../models/Booking');
const Employee = require('../models/Employee');

class BookingAssignmentService {
  /**
   * Assign booking to the nearest available employee
   * @param {string} bookingId - The booking ID to assign
   * @param {number} maxDistance - Maximum search radius in meters (default: 10km)
   * @param {number} maxRetries - Maximum number of employees to try (default: 5)
   * @returns {Object} Assignment result
   */
  static async assignBookingToNearbyEmployee(bookingId, maxDistance = 10000, maxRetries = 5) {
    try {
      // Fetch the booking
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'pending') {
        throw new Error(`Booking is not in pending status. Current status: ${booking.status}`);
      }

      const [longitude, latitude] = booking.location.coordinates;
      const rejectedEmployeeIds = booking.getRejectedEmployeeIds();

      // Find nearby available employees
      let nearbyEmployees = await Employee.findNearby(
        longitude, 
        latitude, 
        maxDistance, 
        booking.serviceType
      );

      // Filter out employees who have already rejected this booking
      nearbyEmployees = nearbyEmployees.filter(employee => 
        !rejectedEmployeeIds.some(rejectedId => 
          rejectedId.toString() === employee._id.toString()
        )
      );

      if (nearbyEmployees.length === 0) {
        // No available employees found
        await this.handleNoEmployeesAvailable(booking, maxDistance);
        return {
          success: false,
          message: 'No available employees found nearby',
          booking: booking
        };
      }

      // Try to assign to the nearest available employee
      const targetEmployee = nearbyEmployees[0];
      
      // Check if employee is still available (race condition protection)
      const currentEmployee = await Employee.findById(targetEmployee._id);
      if (!currentEmployee || currentEmployee.availabilityStatus !== 'available') {
        // Employee is no longer available, try next one
        if (nearbyEmployees.length > 1) {
          return await this.assignToNextEmployee(booking, nearbyEmployees.slice(1));
        } else {
          return {
            success: false,
            message: 'Selected employee is no longer available',
            booking: booking
          };
        }
      }

      // Assign the booking
      booking.assignedEmployee = currentEmployee._id;
      booking.status = 'assigned';
      booking.addAssignmentHistory(currentEmployee._id, 'assigned');

      // Update employee's assigned bookings
      currentEmployee.assignedBookings.push(booking._id);
      
      // Save both documents
      await Promise.all([
        booking.save(),
        currentEmployee.save()
      ]);

      console.log(`✅ Booking ${bookingId} assigned to employee ${currentEmployee.name} (${currentEmployee._id})`);

      return {
        success: true,
        message: 'Booking assigned successfully',
        booking: await Booking.findById(bookingId).populate('assignedEmployee', '-password'),
        employee: {
          id: currentEmployee._id,
          name: currentEmployee.name,
          phone: currentEmployee.phone
        }
      };

    } catch (error) {
      console.error('❌ Error in booking assignment:', error);
      throw error;
    }
  }

  /**
   * Handle rejection and reassign to next available employee
   * @param {string} bookingId - The booking ID
   * @param {string} employeeId - The employee who rejected
   * @param {string} reason - Rejection reason
   * @returns {Object} Reassignment result
   */
  static async handleBookingRejection(bookingId, employeeId, reason = '') {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Add to rejection history
      booking.addRejectionHistory(employeeId, reason);
      
      // Remove from employee's assigned bookings
      employee.assignedBookings = employee.assignedBookings.filter(
        id => id.toString() !== bookingId.toString()
      );

      // Reset booking status to pending
      booking.status = 'pending';
      booking.assignedEmployee = null;

      // Save changes
      await Promise.all([
        booking.save(),
        employee.save()
      ]);

      console.log(`📝 Booking ${bookingId} rejected by employee ${employee.name}. Reason: ${reason}`);

      // Try to reassign to next available employee
      const reassignmentResult = await this.assignBookingToNearbyEmployee(bookingId);
      
      return {
        success: true,
        message: 'Booking rejection processed',
        reassignmentResult
      };

    } catch (error) {
      console.error('❌ Error handling booking rejection:', error);
      throw error;
    }
  }

  /**
   * Handle booking acceptance
   * @param {string} bookingId - The booking ID
   * @param {string} employeeId - The employee who accepted
   * @returns {Object} Acceptance result
   */
  static async handleBookingAcceptance(bookingId, employeeId) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Verify the booking is assigned to this employee
      if (booking.assignedEmployee.toString() !== employeeId.toString()) {
        throw new Error('Booking is not assigned to this employee');
      }

      // Update booking status
      booking.status = 'accepted';
      
      // Update employee status to busy
      employee.availabilityStatus = 'busy';

      // Save changes
      await Promise.all([
        booking.save(),
        employee.save()
      ]);

      console.log(`✅ Booking ${bookingId} accepted by employee ${employee.name}`);

      return {
        success: true,
        message: 'Booking accepted successfully',
        booking: await Booking.findById(bookingId).populate('assignedEmployee', '-password')
      };

    } catch (error) {
      console.error('❌ Error handling booking acceptance:', error);
      throw error;
    }
  }

  /**
   * Handle case when no employees are available
   * @param {Object} booking - The booking object
   * @param {number} searchRadius - The search radius used
   */
  static async handleNoEmployeesAvailable(booking, searchRadius) {
    // Log for monitoring
    console.log(`⚠️ No employees available for booking ${booking._id} within ${searchRadius}m radius`);
    
    // Here you could implement additional logic like:
    // - Expanding search radius
    // - Notifying administrators
    // - Adding to a priority queue
    // - Scheduling for later retry
    
    // For now, we'll just update the booking with a note
    booking.notes = `No employees available within ${searchRadius}m radius at ${new Date().toISOString()}`;
    await booking.save();
  }

  /**
   * Try to assign to next available employee in the list
   * @param {Object} booking - The booking object
   * @param {Array} remainingEmployees - Remaining employees to try
   * @returns {Object} Assignment result
   */
  static async assignToNextEmployee(booking, remainingEmployees) {
    if (remainingEmployees.length === 0) {
      return {
        success: false,
        message: 'No more employees available to try',
        booking: booking
      };
    }

    const nextEmployee = remainingEmployees[0];
    
    // Check availability again
    const currentEmployee = await Employee.findById(nextEmployee._id);
    if (!currentEmployee || currentEmployee.availabilityStatus !== 'available') {
      // Try the next one
      return await this.assignToNextEmployee(booking, remainingEmployees.slice(1));
    }

    // Assign to this employee
    booking.assignedEmployee = currentEmployee._id;
    booking.status = 'assigned';
    booking.addAssignmentHistory(currentEmployee._id, 'assigned');

    currentEmployee.assignedBookings.push(booking._id);
    
    await Promise.all([
      booking.save(),
      currentEmployee.save()
    ]);

    return {
      success: true,
      message: 'Booking assigned to next available employee',
      booking: await Booking.findById(booking._id).populate('assignedEmployee', '-password'),
      employee: {
        id: currentEmployee._id,
        name: currentEmployee.name,
        phone: currentEmployee.phone
      }
    };
  }

  /**
   * Get assignment statistics
   * @returns {Object} Statistics about assignments
   */
  static async getAssignmentStats() {
    try {
      const stats = await Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const employeeStats = await Employee.aggregate([
        {
          $group: {
            _id: '$availabilityStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        bookingStats: stats,
        employeeStats: employeeStats
      };
    } catch (error) {
      console.error('❌ Error getting assignment stats:', error);
      throw error;
    }
  }
}

module.exports = BookingAssignmentService;