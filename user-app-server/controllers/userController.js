const User = require('../models/User');

// @desc    Update user location
// @route   PUT /api/users/location
// @access  Private
const updateUserLocation = async (req, res) => {
  try {
    const { longitude, latitude, address } = req.body;

    // Validate coordinates
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({ message: 'Invalid coordinates provided' });
    }

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Coordinates out of valid range' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update location
    user.location.coordinates = [longitude, latitude];
    user.lastLocationUpdate = new Date();

    // Update address if provided
    if (address) {
      user.address = { ...user.address, ...address };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: user.location,
        address: user.address,
        lastLocationUpdate: user.lastLocationUpdate
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ 
      message: 'Error updating location', 
      error: error.message 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address, preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};

// @desc    Add service to favorites
// @route   POST /api/users/favorites/:serviceId
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in favorites
    if (user.favoriteServices.includes(serviceId)) {
      return res.status(400).json({ message: 'Service already in favorites' });
    }

    user.favoriteServices.push(serviceId);
    await user.save();

    res.json({
      success: true,
      message: 'Service added to favorites',
      data: { favoriteServices: user.favoriteServices }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ 
      message: 'Error adding to favorites', 
      error: error.message 
    });
  }
};

// @desc    Remove service from favorites
// @route   DELETE /api/users/favorites/:serviceId
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favoriteServices = user.favoriteServices.filter(
      id => id.toString() !== serviceId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Service removed from favorites',
      data: { favoriteServices: user.favoriteServices }
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ 
      message: 'Error removing from favorites', 
      error: error.message 
    });
  }
};

module.exports = {
  updateUserLocation,
  updateUserProfile,
  addToFavorites,
  removeFromFavorites
};