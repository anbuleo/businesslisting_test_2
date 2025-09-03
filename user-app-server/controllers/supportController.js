const SupportTicket = require('../models/SupportTicket');

// @desc    Create support ticket
// @route   POST /api/support/tickets
// @access  Private
const createSupportTicket = async (req, res) => {
  try {
    const { subject, description, category, priority = 'medium', relatedBooking } = req.body;

    const ticket = await SupportTicket.create({
      user: req.user.id,
      subject,
      description,
      category,
      priority,
      relatedBooking: relatedBooking || null
    });

    // Add initial message
    ticket.addMessage(
      {
        id: req.user.id,
        type: 'user',
        name: req.user.name
      },
      description
    );

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email phone')
      .populate('relatedBooking', 'bookingId serviceDetails status');

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: populatedTicket
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ 
      message: 'Error creating support ticket', 
      error: error.message 
    });
  }
};

// @desc    Get user's support tickets
// @route   GET /api/support/tickets
// @access  Private
const getUserSupportTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query)
      .populate('relatedBooking', 'bookingId serviceDetails status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTickets: total
        }
      }
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ 
      message: 'Error fetching support tickets', 
      error: error.message 
    });
  }
};

// @desc    Get support ticket by ID
// @route   GET /api/support/tickets/:id
// @access  Private
const getSupportTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('relatedBooking', 'bookingId serviceDetails status');

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Check if user owns this ticket
    if (ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({ 
      message: 'Error fetching support ticket', 
      error: error.message 
    });
  }
};

// @desc    Add message to support ticket
// @route   POST /api/support/tickets/:id/messages
// @access  Private
const addMessageToTicket = async (req, res) => {
  try {
    const { content, attachments = [] } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Check if user owns this ticket
    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add messages to this ticket' });
    }

    await ticket.addMessage(
      {
        id: req.user.id,
        type: 'user',
        name: req.user.name
      },
      content,
      attachments
    );

    // Update ticket status if it was resolved
    if (ticket.status === 'resolved') {
      ticket.status = 'open';
      await ticket.save();
    }

    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email phone')
      .populate('relatedBooking', 'bookingId serviceDetails status');

    res.json({
      success: true,
      message: 'Message added successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Add message to ticket error:', error);
    res.status(500).json({ 
      message: 'Error adding message to ticket', 
      error: error.message 
    });
  }
};

module.exports = {
  createSupportTicket,
  getUserSupportTickets,
  getSupportTicketById,
  addMessageToTicket
};