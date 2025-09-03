import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'; 
import dotenv from 'dotenv';      
import { Server } from 'socket.io'; // Changed this line
import bookingRoutes from './routes/bookingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import walletRoutes from './routes/userWalletRoutes.js';
import socketHandlers from './socket/socketHandlers.js';  
import authRoutes from './routes/authRoutes.js'; // Added this line
import userRoutes from './routes/userRoutes.js'; // Added this line

dotenv.config();

const app = express();  
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;  

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

// Socket.IO setup - Fixed this section
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'http://localhost:5174',
    methods: ['GET', 'POST']
  }
});

app.set('io', io); // Make io accessible in controllers
socketHandlers(io); // Pass io to socket handlers

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);          
app.use('/api/wallet', walletRoutes);
app.use('/api/auth', authRoutes)  ; // Auth routes
app.use('/api/users', userRoutes);

// Error handling middleware      
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});

// 404 handler


app.use('/', (req, res) => {
  res.send('User App Server is running');
});
// Removed the problematic line with require
// app.use('/socket', require('./socket')(io));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)  
});