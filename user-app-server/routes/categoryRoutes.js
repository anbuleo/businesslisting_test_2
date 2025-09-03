const express = require('express');
const { getCategories, getCategoryBySlug, createCategory } = require('../controllers/categoryController');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', createCategory); // Should be admin only in production

module.exports = router;