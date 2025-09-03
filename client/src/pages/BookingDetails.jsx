import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Clock, 
  User, 
  Phone,
  Video,
  MessageCircle,
  Mail, 
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Play,
  Square
} from 'lucide-react';
import { io } from 'socket.io-client';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000'); // Connect to employee app backend
    setSocket(newSocket);

    // Listen for incoming calls (from user app)
    newSocket.on('incoming_call', (data) => {
      if (data.callType === 'voice') {
        setShowVoiceCall(true);
      }
    });

    fetchBookingDetails();
  }, [id]);

  // Cleanup socket on unmount
  useEffect(() => () => { if (socket) socket.disconnect(); }, [socket]);

  const fetchBookingDetails = async () => {
    try {
      const response = await axios.get(`/api/bookings/${id}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (action, reason = '') => {
    setActionLoading(true);
    try {
      const endpoint = action === 'accept' ? 'accept' : 'reject';
      const payload = action === 'reject' ? { reason } : {};
      
      await axios.post(`/api/bookings/${id}/${endpoint}`, payload);
      
      // Refresh booking details
      await fetchBookingDetails();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      setError(`Failed to ${action} booking`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (status, notes = '') => {
    setActionLoading(true);
    try {
      await axios.put(`/api/bookings/${id}/status`, { status, notes });
      
      // Refresh booking details
      await fetchBookingDetails();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitiateCall = (socketInstance, callType) => {
    if (!booking.customerContact?.name || !booking.userId) {
      setError('Customer contact details missing for call.');
      return;
    }
    socketInstance.emit('initiate_call', {
      bookingId: booking._id, callType, callerInfo: { id: employee.id, name: employee.name, type: 'employee' }
    });
    setShowVoiceCall(true);
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

  if (error && !booking) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Booking</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {booking.serviceType} Service
            </h1>
            <span className={`status-badge ${getStatusColor(booking.status)} mt-2`}>
              {booking.status.replace('_', ' ')}
            </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{booking.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <p className="text-gray-900 capitalize">{booking.serviceType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    booking.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    booking.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {booking.priority}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Scheduled Time
                    </label>
                    <p className="text-gray-900">{formatDate(booking.scheduledTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <p className="text-gray-900">{booking.estimatedDuration} minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            
            {booking.address ? (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    {booking.address.street}
                  </p>
                  <p className="text-gray-600">
                    {booking.address.city}, {booking.address.state} {booking.address.zipCode}
                  </p>
                  <p className="text-gray-600">
                    {booking.address.country}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  Coordinates: {booking.location.coordinates[1]}, {booking.location.coordinates[0]}
                </span>
              </div>
            )}
          </div>

          {/* Customer Contact */}
          {booking.customerContact && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Contact</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{booking.customerContact.name}</p>
                  </div>
                </div>
                
                {booking.customerContact.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <a 
                        href={`tel:${booking.customerContact.phone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {booking.customerContact.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {booking.customerContact.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <a 
                        href={`mailto:${booking.customerContact.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {booking.customerContact.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          {booking.pricing && (booking.pricing.estimatedCost > 0 || booking.pricing.finalCost > 0) && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              
              <div className="space-y-3">
                {booking.pricing.estimatedCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estimated Cost</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(booking.pricing.estimatedCost)}
                    </span>
                  </div>
                )}
                
                {booking.pricing.finalCost > 0 && (
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-gray-900 font-medium">Final Cost</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(booking.pricing.finalCost)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            
            <div className="space-y-3">
              {booking.status === 'assigned' && (
                <>
                  <button
                    onClick={() => handleBookingAction('accept')}
                    disabled={actionLoading}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept Booking</span>
                  </button>
                  
                  <button
                    onClick={() => handleBookingAction('reject', 'Not available at this time')}
                    disabled={actionLoading}
                    className="w-full btn-secondary"
                  >
                    Reject Booking
                  </button>
                </>
              )}
              
              {booking.status === 'accepted' && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={actionLoading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Work</span>
                </button>
              )}
              
              {booking.status === 'in_progress' && (
                <button
                  onClick={() => handleStatusUpdate('completed', 'Work completed successfully')}
                  disabled={actionLoading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
              )}

              {/* New Communication Features */}
              {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                <>
                  <button
                    onClick={() => setShowChat(true)}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with User</span>
                  </button>
                  <button
                    onClick={() => handleInitiateCall(socket, 'voice')}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call User</span>
                  </button>
                </>
              )}
              
              {actionLoading && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Info</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-mono text-gray-900">{booking._id.slice(-8)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">{formatDate(booking.createdAt)}</span>
              </div>
              
              {booking.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-gray-900">{formatDate(booking.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-4">
            <Chat booking={booking} onClose={() => setShowChat(false)} onInitiateCall={handleInitiateCall} />
          </div>
        </div>
      )}

      {/* Voice Call Modal */}
      {showVoiceCall && (
        <VoiceCall 
          booking={booking} 
          socket={socket}
          onClose={() => setShowVoiceCall(false)} 
        />
      )}
    </div>
  );
};

export default BookingDetails;