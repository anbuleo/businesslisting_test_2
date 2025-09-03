const express = require('express');
const { 
  createBooking, 
  getUserBookings, 
  getBookingById, 
  cancelBooking 
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(auth);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;