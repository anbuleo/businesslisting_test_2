const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const walletRoutes = require('./routes/walletRoutes');
const socketHandlers = require('./socket/socketHandlers');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO setup
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'http://localhost:5174', // User app origin
    methods: ['GET', 'POST']
  }
});
app.set('io', io); // Make io accessible in controllers
socketHandlers(io); // Pass io to socket handlers

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wallet', walletRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});