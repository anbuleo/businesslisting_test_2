const express = require('express');
const { 
  getServices, 
  getServiceBySlug, 
  getFeaturedServices, 
  createService 
} = require('../controllers/serviceController');

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/featured', getFeaturedServices);
router.get('/:slug', getServiceBySlug);
router.post('/', createService); // Should be admin only in production

module.exports = router;