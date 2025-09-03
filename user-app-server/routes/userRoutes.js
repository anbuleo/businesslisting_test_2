const express = require('express');
const { 
  updateUserLocation, 
  updateUserProfile, 
  addToFavorites, 
  removeFromFavorites 
} = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(auth);

router.put('/location', updateUserLocation);
router.put('/profile', updateUserProfile);
router.post('/favorites/:serviceId', addToFavorites);
router.delete('/favorites/:serviceId', removeFromFavorites);

module.exports = router;