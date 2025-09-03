const express = require('express');
const {
  createBooking,
  acceptBooking,
  rejectBooking,
  getBooking,
  updateBookingStatus,
  getAssignmentStats
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes (for testing - in production, these would be from user app)
router.post('/', createBooking);

// Protected routes (Employee)
router.get('/stats', auth, getAssignmentStats);
router.get('/:id', auth, getBooking);
router.post('/:id/accept', auth, acceptBooking);
router.post('/:id/reject', auth, rejectBooking);
router.put('/:id/status', auth, updateBookingStatus);

module.exports = router;