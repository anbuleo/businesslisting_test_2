const express = require('express');
const {
  registerEmployee,
  loginEmployee,
  getEmployeeProfile,
  updateLocation,
  updateAvailability,
  getAssignedBookings
} = require('../controllers/employeeController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerEmployee);
router.post('/login', loginEmployee);

// Protected routes
router.get('/profile', auth, getEmployeeProfile);
router.put('/location', auth, updateLocation);
router.put('/availability', auth, updateAvailability);
router.get('/bookings', auth, getAssignedBookings);

module.exports = router;