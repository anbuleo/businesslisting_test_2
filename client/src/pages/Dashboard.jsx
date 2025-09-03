import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  User,
  Phone
} from 'lucide-react';

const Dashboard = () => {
  const { employee, updateLocation, updateAvailability } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  // Fetch assigned bookings
  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/employees/bookings');
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/bookings/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchStats();
    
    // Set up polling for new bookings every 30 seconds
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle location update
  const handleLocationUpdate = async () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          const result = await updateLocation(longitude, latitude, employee.availabilityStatus);
          
          if (!result.success) {
            setError('Failed to update location');
          }
          setLocationLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Failed to get current location');
          setLocationLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
    }
  };

  // Handle availability toggle
  const handleAvailabilityToggle = async () => {
    const newStatus = employee.availabilityStatus === 'available' ? 'offline' : 'available';
    const result = await updateAvailability(newStatus);
    
    if (!result.success) {
      setError('Failed to update availability');
    }
  };

  // Handle booking action
  const handleBookingAction = async (bookingId, action, reason = '') => {
    try {
      const endpoint = action === 'accept' ? 'accept' : 'reject';
      const payload = action === 'reject' ? { reason } : {};
      
      await axios.post(`/api/bookings/${bookingId}/${endpoint}`, payload);
      
      // Refresh bookings
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      setError(`Failed to ${action} booking`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'status-assigned';
      case 'accepted': return 'status-accepted';
      case 'in_progress': return 'status-in_progress';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {employee?.name}! Here are your assigned bookings.
          </p>
        </div>
        
        <div className="flex space-x-3">
          {/* Location Update Button */}
          <button
            onClick={handleLocationUpdate}
            disabled={locationLoading}
            className="btn-secondary flex items-center space-x-2"
          >
            {locationLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            <span>Update Location</span>
          </button>
          
          {/* Availability Toggle */}
          <button
            onClick={handleAvailabilityToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              employee?.availabilityStatus === 'available'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {employee?.availabilityStatus === 'available' ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>Go Offline</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Go Online</span>
              </>
            )}
          </button>
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
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{employee?.totalJobs || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employee?.rating ? `${employee.rating.toFixed(1)}/5` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Assigned Bookings</h2>
          <button
            onClick={fetchBookings}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="card text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings assigned</h3>
            <p className="text-gray-600">
              {employee?.availabilityStatus === 'available' 
                ? 'New bookings will appear here when assigned to you.'
                : 'Set your status to "Available" to receive new bookings.'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {booking.serviceType} Service
                      </h3>
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(booking.scheduledTime)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-gray-700">{booking.description}</p>
                  
                  {booking.address && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {booking.address.street}, {booking.address.city}, {booking.address.state}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{booking.estimatedDuration} min</span>
                    </div>
                    
                    {booking.pricing?.estimatedCost > 0 && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(booking.pricing.estimatedCost)}</span>
                      </div>
                    )}
                  </div>

                  {booking.customerContact && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{booking.customerContact.name}</span>
                      </div>
                      
                      {booking.customerContact.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{booking.customerContact.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <Link
                    to={`/booking/${booking._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Details
                  </Link>
                  
                  <div className="flex space-x-3">
                    {booking.status === 'assigned' && (
                      <>
                        <button
                          onClick={() => handleBookingAction(booking._id, 'reject', 'Not available')}
                          className="btn-secondary text-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking._id, 'accept')}
                          className="btn-primary text-sm"
                        >
                          Accept
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'accepted' && (
                      <span className="text-green-600 font-medium text-sm">
                        ✓ Accepted - Ready to start
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;