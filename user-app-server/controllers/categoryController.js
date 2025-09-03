const Category = require('../models/Category');
const Service = require('../models/Service');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { location } = req.query;
    let categories;

    if (location) {
      // If location is provided, get categories with available services in that location
      const [longitude, latitude] = location.split(',').map(Number);
      
      // Get services available in the location
      const availableServices = await Service.findByLocation(longitude, latitude);
      const categoryIds = [...new Set(availableServices.map(service => service.category.toString()))];
      
      categories = await Category.find({
        _id: { $in: categoryIds },
        isActive: true
      }).sort({ sortOrder: 1, name: 1 });
    } else {
      // Get all active categories
      categories = await Category.find({ isActive: true })
        .sort({ sortOrder: 1, name: 1 });
    }

    // Update service count for each category
    for (let category of categories) {
      const serviceCount = await Service.countDocuments({
        category: category._id,
        isActive: true,
        'availability.isAvailable': true
      });
      category.serviceCount = serviceCount;
    }

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get service count
    const serviceCount = await Service.countDocuments({
      category: category._id,
      isActive: true,
      'availability.isAvailable': true
    });

    category.serviceCount = serviceCount;

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ 
      message: 'Error fetching category', 
      error: error.message 
    });
  }
};

// @desc    Create category (Admin only - for seeding)
// @route   POST /api/categories
// @access  Public (should be admin only in production)
const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      message: 'Error creating category', 
      error: error.message 
    });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory
};