import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import SEOHead from '../components/SEOHead';
import axios from 'axios';
import { 
  MapPin, 
  Search, 
  Star, 
  Clock, 
  ArrowRight,
  Zap,
  Shield,
  Users,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const Home = () => {
  const { user, updateLocation } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [user?.location]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get user's location for location-based queries
      const locationParam = user?.location?.coordinates?.length === 2 
        ? `${user.location.coordinates[0]},${user.location.coordinates[1]}`
        : null;

      // Fetch categories and featured services
      const [categoriesRes, featuredRes] = await Promise.all([
        axios.get(`/api/categories${locationParam ? `?location=${locationParam}` : ''}`),
        axios.get(`/api/services/featured${locationParam ? `?location=${locationParam}` : ''}`)
      ]);

      setCategories(categoriesRes.data.data);
      setFeaturedServices(featuredRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          const result = await updateLocation(longitude, latitude);
          
          if (result.success) {
            // Refresh data with new location
            fetchData();
          } else {
            setError('Failed to update location');
          }
          setLocationLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Failed to get current location. Please enable location services.');
          setLocationLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SEOHead 
        title="Home Services at Your Doorstep"
        description="Book trusted local services like plumbing, electrical, cleaning, and more. Pay only 10% advance, track your service provider in real-time."
        keywords="home services, plumbing, electrical, cleaning, repair, maintenance, local services, service booking, doorstep services"
      />
      
      <SEOHead 
        title="Home Services at Your Doorstep"
        description="Book trusted local services like plumbing, electrical, cleaning, and more. Pay only 10% advance, track your service provider in real-time."
        keywords="home services, plumbing, electrical, cleaning, repair, maintenance, local services, service booking, doorstep services"
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">
            Book Local Services Instantly
          </h1>
          <p className="text-xl text-primary-100 mb-6">
            From plumbing to cleaning, find trusted professionals in your area. 
            Pay only 10% advance, rest after service completion.
          </p>
          
          {/* Location Section */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
              <MapPin className="w-5 h-5" />
              <span className="text-sm">
                {user?.address?.city ? `${user.address.city}, ${user.address.state}` : 'Location not set'}
              </span>
            </div>
            <button
              onClick={handleLocationUpdate}
              disabled={locationLoading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              {locationLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              <span>Update Location</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Booking</h3>
          <p className="text-gray-600">Book services instantly with just a few clicks. No waiting, no hassle.</p>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Professionals</h3>
          <p className="text-gray-600">All service providers are background-checked and verified.</p>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
          <p className="text-gray-600">Get help anytime with our dedicated customer support team.</p>
        </div>
      </div>

      {/* Service Categories */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Service Categories</h2>
          <span className="text-sm text-gray-600">
            {categories.length} categories available
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="card text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services in your area</h3>
            <p className="text-gray-600 mb-4">
              Try updating your location or check back later for new services.
            </p>
            <button
              onClick={handleLocationUpdate}
              className="btn-primary"
            >
              Update Location
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="category-card group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 text-center mb-3">
                  {category.serviceCount} services
                </p>
                <div className="flex items-center justify-center text-primary-600 group-hover:text-primary-700">
                  <span className="text-sm font-medium">View Services</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Services</h2>
            <Link 
              to="/services" 
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Link
                key={service._id}
                to={`/service/${service.slug}`}
                className="service-card group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {service.shortDescription || service.description}
                    </p>
                  </div>
                  <span 
                    className="inline-block w-3 h-3 rounded-full ml-3 mt-1"
                    style={{ backgroundColor: service.category.color }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="price-tag">
                      {formatCurrency(service.pricing.basePrice)}
                    </span>
                    
                    {service.rating.count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {service.rating.average.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({service.rating.count})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {service.duration.estimated}m
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gray-100 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Need Help Finding the Right Service?
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our customer support team is here to help you find the perfect service provider 
          for your needs. Get personalized recommendations and instant assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary">
            Contact Support
          </button>
          <button className="btn-outline">
            Browse All Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;