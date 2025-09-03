const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', auth, getUserProfile);

module.exports = router;