import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(`/api/bookings${params}`);
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'assigned': return 'status-assigned';
      case 'accepted': return 'status-accepted';
      case 'in_progress': return 'status-in_progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your service bookings
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
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

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filter by status:</span>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Start by browsing our services and make your first booking.'
              : `You don't have any ${filter} bookings at the moment.`
            }
          </p>
          <Link to="/" className="btn-primary">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking._id}
              to={`/booking/${booking._id}`}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.serviceDetails.name}
                    </h3>
                    <span className={`status-badge ${getStatusColor(booking.status)} flex items-center space-x-1`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {booking.serviceDetails.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Scheduled: {formatDate(booking.scheduledDateTime)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {booking.serviceDetails.estimatedDuration}m</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.address.city}, {booking.address.state}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {formatCurrency(booking.pricing.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Booking ID: {booking.bookingId}
                  </div>
                  {booking.employeeDetails && (
                    <div className="text-sm text-primary-600 mt-2">
                      Assigned to {booking.employeeDetails.name}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.payment.advance.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800' // Changed to red for pending advance
                    }`}>
                      Advance: {booking.payment.advance.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.payment.remaining.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      Remaining: {booking.payment.remaining.status}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    Created {formatDate(booking.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;