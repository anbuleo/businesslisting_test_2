const express = require('express');
const { 
  sendMessage, 
  getBookingMessages, 
  markMessagesAsRead 
} = require('../controllers/messageController');
const auth = require('../middleware/auth');

const router = express.Router();

// All message routes require authentication
router.use(auth);

router.post('/', sendMessage);
router.get('/:bookingId', getBookingMessages);
router.put('/:bookingId/read', markMessagesAsRead);

module.exports = router;