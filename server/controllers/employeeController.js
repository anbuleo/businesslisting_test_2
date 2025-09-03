const Employee = require('../models/Employee');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new employee
// @route   POST /api/employees/register
// @access  Public
const registerEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, serviceTypes } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists with this email' });
    }

    // Create employee
    const employee = await Employee.create({
      name,
      email,
      password,
      phone,
      serviceTypes: serviceTypes || []
    });

    // Create wallet for the employee
    const wallet = await Wallet.create({
      employeeId: employee._id
    });

    // Link wallet to employee
    employee.wallet = wallet._id;
    await employee.save();

    // Generate token
    const token = generateToken(employee._id);

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        data: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          serviceTypes: employee.serviceTypes,
          availabilityStatus: employee.availabilityStatus,
          wallet: {
            balance: wallet.balance,
            currency: wallet.currency
          }
        },
        token
      }
    });
  } catch (error) {
    console.error('Register employee error:', error);
    res.status(500).json({ 
      message: 'Error registering employee', 
      error: error.message 
    });
  }
};

// @desc    Login employee
// @route   POST /api/employees/login
// @access  Public
const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if employee exists
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(employee._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        data: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          serviceTypes: employee.serviceTypes,
          availabilityStatus: employee.availabilityStatus,
          location: employee.location
        },
        token
      }
    });
  } catch (error) {
    console.error('Login employee error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

// @desc    Get employee profile
// @route   GET /api/employees/profile
// @access  Private
const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id)
      .select('-password')
      .populate('assignedBookings')
      .populate('wallet');

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

// @desc    Update employee location and availability
// @route   PUT /api/employees/location
// @access  Private
const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude, availabilityStatus } = req.body;

    // Validate coordinates
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({ message: 'Invalid coordinates provided' });
    }

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Coordinates out of valid range' });
    }

    const employee = await Employee.findById(req.employee.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update location
    employee.location.coordinates = [longitude, latitude];
    employee.lastLocationUpdate = new Date();

    // Update availability status if provided
    if (availabilityStatus && ['available', 'busy', 'offline'].includes(availabilityStatus)) {
      employee.availabilityStatus = availabilityStatus;
    }

    await employee.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: employee.location,
        availabilityStatus: employee.availabilityStatus,
        lastLocationUpdate: employee.lastLocationUpdate
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ 
      message: 'Error updating location', 
      error: error.message 
    });
  }
};

// @desc    Update availability status
// @route   PUT /api/employees/availability
// @access  Private
const updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    if (!['available', 'busy', 'offline'].includes(availabilityStatus)) {
      return res.status(400).json({ message: 'Invalid availability status' });
    }

    const employee = await Employee.findById(req.employee.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.availabilityStatus = availabilityStatus;
    await employee.save();

    res.json({
      success: true,
      message: 'Availability status updated successfully',
      data: {
        availabilityStatus: employee.availabilityStatus
      }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ 
      message: 'Error updating availability', 
      error: error.message 
    });
  }
};

// @desc    Get assigned bookings
// @route   GET /api/employees/bookings
// @access  Private
const getAssignedBookings = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id)
      .populate({
        path: 'assignedBookings',
        match: { status: { $in: ['assigned', 'accepted', 'in_progress'] } },
        options: { sort: { scheduledTime: 1 } }
      });

    res.json({
      success: true,
      data: employee.assignedBookings || []
    });
  } catch (error) {
    console.error('Get assigned bookings error:', error);
    res.status(500).json({ 
      message: 'Error fetching assigned bookings', 
      error: error.message 
    });
  }
};

module.exports = {
  registerEmployee,
  loginEmployee,
  getEmployeeProfile,
  updateLocation,
  updateAvailability,
  getAssignedBookings
};