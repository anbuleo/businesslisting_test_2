import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import VoiceCall from '../components/VoiceCall';
import EmployeeTracker from '../components/EmployeeTracker';
import SEOHead from '../components/SEOHead';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Navigation,
  Video
} from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5174');
    setSocket(newSocket);

    // Listen for incoming calls
    newSocket.on('incoming_call', (data) => {
      if (data.callType === 'voice') {
        setShowVoiceCall(true);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/bookings/${id}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setCancelLoading(true);
    try {
      await axios.put(`/api/bookings/${id}/cancel`, {
        reason: cancelReason || 'Cancelled by user'
      });
      
      // Refresh booking details
      await fetchBookingDetails();
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError(error.response?.data?.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
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
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      case 'in_progress': return <Clock className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
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

  const canCancelBooking = () => {
    return booking && ['pending', 'assigned', 'accepted'].includes(booking.status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Booking</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="btn-primary"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEOHead 
        title={`Booking Details - ${booking?.serviceDetails?.name}`}
        description={`Track your ${booking?.serviceDetails?.name} booking. View status, communicate with your service provider, and manage your booking.`}
        keywords={`booking details, ${booking?.serviceDetails?.name}, track booking, service status`}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/bookings')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Details
            </h1>
            <p className="text-gray-600">
              Booking ID: {booking.bookingId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`status-badge ${getStatusColor(booking.status)} flex items-center space-x-1`}>
            {getStatusIcon(booking.status)}
            <span className="capitalize">{booking.status.replace('_', ' ')}</span>
          </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {booking.serviceDetails.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {booking.serviceDetails.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Scheduled Date & Time</p>
                    <p className="text-gray-900">{formatDate(booking.scheduledDateTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Duration</p>
                    <p className="text-gray-900">{booking.serviceDetails.estimatedDuration} minutes</p>
                  </div>
                </div>
              </div>

              {booking.customerNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Your Notes</p>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                    {booking.customerNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Location</h2>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-gray-900 font-medium">
                  {booking.address.street}
                </p>
                <p className="text-gray-600">
                  {booking.address.city}, {booking.address.state} {booking.address.zipCode}
                </p>
                {booking.address.landmark && (
                  <p className="text-gray-600 text-sm">
                    Landmark: {booking.address.landmark}
                  </p>
                )}
                {booking.address.instructions && (
                  <p className="text-gray-600 text-sm mt-2">
                    Instructions: {booking.address.instructions}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Employee Details */}
          {booking.employeeDetails && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Professional</h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{booking.employeeDetails.name}</h3>
                  <p className="text-gray-600">{booking.employeeDetails.phone}</p>
                  {booking.employeeDetails.rating && (
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {booking.employeeDetails.rating}/5
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Navigation className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {booking.timeline && booking.timeline.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h2>
              <div className="space-y-4">
                {booking.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {event.status.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(event.timestamp)}
                      </p>
                      {event.note && (
                        <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Amount</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(booking.pricing.baseAmount)}
                </span>
              </div>
              
              {booking.pricing.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(booking.pricing.discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium text-gray-900">Total Amount</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(booking.pricing.totalAmount)}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Advance Paid</span>
                  <span className={`font-medium ${
                    booking.payment.advance.status === 'completed' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {formatCurrency(booking.pricing.advanceAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(booking.pricing.remainingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Advance Payment</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  booking.payment.advance.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.payment.advance.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Remaining Payment</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  booking.payment.remaining.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {booking.payment.remaining.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {booking.employeeDetails && (
                <>
                  <button className="w-full btn-primary flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Professional</span>
                  </button>
                  
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Navigation className="w-4 h-4" />
                    <span>Track Location</span>
                  </button>
                </>
              )}
              
              {canCancelBooking() && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel Booking
                </button>
              )}
              
              <button className="w-full btn-outline">
                Contact Support
              </button>
              
              {/* New Communication Features */}
              {booking.employeeDetails && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                <>
                  <button
                    onClick={() => setShowChat(true)}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with Professional</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Booking Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-mono text-gray-900">{booking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">{formatDate(booking.createdAt)}</span>
              </div>
              {booking.coupon && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coupon Used</span>
                  <span className="text-green-600 font-medium">{booking.coupon.code}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Please let us know why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 btn-secondary"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Cancelling...</span>
                  </div>
                ) : (
                  'Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;