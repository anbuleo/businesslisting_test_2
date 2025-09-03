const Service = require('../models/Service');
const Category = require('../models/Category');

// @desc    Get services by location and category
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { 
      location, 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sortBy = 'rating', 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {
      isActive: true,
      'availability.isAvailable': true
    };

    // Location-based filtering
    if (location) {
      const [longitude, latitude] = location.split(',').map(Number);
      const maxDistance = 15000; // 15km radius

      query['availability.serviceAreas.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      };
    }

    // Category filtering
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Price filtering
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = Number(maxPrice);
    }

    // Search filtering
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortOptions = {};
    switch (sortBy) {
      case 'price_low':
        sortOptions = { 'pricing.basePrice': 1 };
        break;
      case 'price_high':
        sortOptions = { 'pricing.basePrice': -1 };
        break;
      case 'rating':
        sortOptions = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'popular':
        sortOptions = { bookingCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { 'rating.average': -1 };
    }

    const services = await Service.find(query)
      .populate('category', 'name slug color')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-availability.serviceAreas'); // Exclude large coordinate arrays

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalServices: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ 
      message: 'Error fetching services', 
      error: error.message 
    });
  }
};

// @desc    Get service by slug
// @route   GET /api/services/:slug
// @access  Public
const getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    }).populate('category', 'name slug color');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ 
      message: 'Error fetching service', 
      error: error.message 
    });
  }
};

// @desc    Get featured services
// @route   GET /api/services/featured
// @access  Public
const getFeaturedServices = async (req, res) => {
  try {
    const { location, limit = 10 } = req.query;
    
    let query = {
      isActive: true,
      'availability.isAvailable': true,
      isFeatured: true
    };

    // Location-based filtering
    if (location) {
      const [longitude, latitude] = location.split(',').map(Number);
      const maxDistance = 20000; // 20km radius for featured services

      query['availability.serviceAreas.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      };
    }

    const services = await Service.find(query)
      .populate('category', 'name slug color')
      .sort({ 'rating.average': -1, bookingCount: -1 })
      .limit(parseInt(limit))
      .select('-availability.serviceAreas');

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({ 
      message: 'Error fetching featured services', 
      error: error.message 
    });
  }
};

// @desc    Create service (Admin only - for seeding)
// @route   POST /api/services
// @access  Public (should be admin only in production)
const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ 
      message: 'Error creating service', 
      error: error.message 
    });
  }
};

module.exports = {
  getServices,
  getServiceBySlug,
  getFeaturedServices,
  createService
};