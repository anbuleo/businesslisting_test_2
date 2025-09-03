const express = require('express');
const { 
  createSupportTicket, 
  getUserSupportTickets, 
  getSupportTicketById, 
  addMessageToTicket 
} = require('../controllers/supportController');
const auth = require('../middleware/auth');

const router = express.Router();

// All support routes require authentication
router.use(auth);

router.post('/tickets', createSupportTicket);
router.get('/tickets', getUserSupportTickets);
router.get('/tickets/:id', getSupportTicketById);
router.post('/tickets/:id/messages', addMessageToTicket);

module.exports = router;