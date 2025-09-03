import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
// import SEOHead from '../components/SEOHead';
import axios from 'axios';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Filter,
  SlidersHorizontal,
  MapPin,
  AlertCircle
} from 'lucide-react';

const CategoryServices = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'rating',
    minPrice: '',
    maxPrice: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategoryAndServices();
  }, [slug, filters]);

  const fetchCategoryAndServices = async () => {
    try {
      setLoading(true);
      
      // Get user's location for location-based queries
      const locationParam = user?.location?.coordinates?.length === 2 
        ? `${user.location.coordinates[0]},${user.location.coordinates[1]}`
        : null;

      // Fetch category details
      const categoryRes = await axios.get(`/api/categories/${slug}`);
      setCategory(categoryRes.data.data);

      // Build services query
      const params = new URLSearchParams();
      if (locationParam) params.append('location', locationParam);
      params.append('category', slug);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);

      // Fetch services
      const servicesRes = await axios.get(`/api/services?${params.toString()}`);
      setServices(servicesRes.data.data.services);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
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

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Services</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchCategoryAndServices}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEOHead 
        title={`${category?.name} Services`}
        description={`Professional ${category?.name?.toLowerCase()} services in your area. Book instantly with verified professionals. Pay only 10% advance.`}
        keywords={`${category?.name?.toLowerCase()}, ${category?.name?.toLowerCase()} services, local ${category?.name?.toLowerCase()}, book ${category?.name?.toLowerCase()}`}
      />
      
      <SEOHead 
        title={`${category?.name} Services`}
        description={`Professional ${category?.name?.toLowerCase()} services in your area. Book instantly with verified professionals. Pay only 10% advance.`}
        keywords={`${category?.name?.toLowerCase()}, ${category?.name?.toLowerCase()} services, local ${category?.name?.toLowerCase()}, book ${category?.name?.toLowerCase()}`}
      />
      
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {category?.name} Services
          </h1>
          <p className="text-gray-600 mt-1">
            {category?.description || `Find professional ${category?.name.toLowerCase()} services in your area`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters</span>
            <span className="text-sm text-gray-500">
              {services.length} services found
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search services..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input-field"
              >
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="10000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="card text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
          <p className="text-gray-600 mb-4">
            No {category?.name.toLowerCase()} services are available in your area. 
            Try adjusting your filters or check back later.
          </p>
          <Link to="/" className="btn-primary">
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service._id}
              to={`/service/${service.slug}`}
              className="service-card group"
            >
              {/* Service Image Placeholder */}
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${service.category.color}20` }}
                >
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: service.category.color }}
                  />
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.shortDescription || service.description}
                  </p>
                </div>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{service.features.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Price and Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
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

                {/* Advance Payment Info */}
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                  Pay only {service.pricing.advancePayment}% advance • 
                  Rest after service completion
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryServices;