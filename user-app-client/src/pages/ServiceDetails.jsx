import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import axios from 'axios';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MapPin,
  Calendar,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Heart,
  Share2
} from 'lucide-react';

const ServiceDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    scheduledDateTime: '',
    timeSlot: { start: '', end: '' },
    customerNotes: '', // This is for the user's notes
    paymentMethod: 'online', // 'online' or 'wallet'
    couponCode: ''
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [slug]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/services/${slug}`);
      setService(response.data.data);
    } catch (error) {
      console.error('Error fetching service details:', error);
      setError('Failed to load service details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const bookingPayload = {
        serviceId: service._id,
        location: {
          coordinates: user.location.coordinates
        },
        address: user.address,
        scheduledDateTime: bookingData.scheduledDateTime,
        timeSlot: bookingData.timeSlot,
        customerNotes: bookingData.customerNotes,
        couponCode: bookingData.couponCode || undefined,
        paymentMethod: bookingData.paymentMethod
      };

      const response = await axios.post('/api/bookings', bookingPayload);
      
      // Redirect to booking details
      navigate(`/booking/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateAdvanceAmount = () => {
    if (!service) return 0;
    let baseAmount = service.pricing.basePrice;
    
    // Apply coupon discount if any
    if (bookingData.couponCode === 'FIRST10') {
      baseAmount = baseAmount * 0.9; // 10% discount
    }
    
    return Math.round((baseAmount * service.pricing.advancePayment) / 100);
  };

  const calculateTotalAmount = () => {
    if (!service) return 0;
    let baseAmount = service.pricing.basePrice;
    
    // Apply coupon discount if any
    if (bookingData.couponCode === 'FIRST10') {
      baseAmount = baseAmount * 0.9; // 10% discount
    }
    
    return baseAmount;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Service</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchServiceDetails}
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
        title={service?.name}
        description={service?.description}
        keywords={`${service?.name}, ${service?.category?.name}, home services, book ${service?.name?.toLowerCase()}`}
      />
      
      <SEOHead 
        title={service?.name}
        description={service?.description}
        keywords={`${service?.name}, ${service?.category?.name}, home services, book ${service?.name?.toLowerCase()}`}
      />
      
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Link
              to={`/category/${service.category.slug}`}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {service.category.name}
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">Service Details</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {service.name}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
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
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Image */}
          <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
            <div 
              className="w-24 h-24 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${service.category.color}20` }}
            >
              <div 
                className="w-12 h-12 rounded-lg"
                style={{ backgroundColor: service.category.color }}
              />
            </div>
          </div>

          {/* Service Info */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(service.pricing.basePrice)}
                </span>
                {service.rating.count > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900">
                      {service.rating.average.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({service.rating.count} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <span>{service.duration.estimated} minutes</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{service.description}</p>
              </div>

              {service.features && service.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {service.requirements && service.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {service.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(service.availability.workingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center">
                  <span className="capitalize font-medium text-gray-700">{day}</span>
                  <span className={`text-sm ${hours.available ? 'text-gray-600' : 'text-red-600'}`}>
                    {hours.available ? `${hours.start} - ${hours.end}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Verified Professional</span>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Pay only {service.pricing.advancePayment}% advance</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">Available in your area</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book This Service</h3>
            
            {!showBookingForm ? (
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full btn-primary py-3 text-lg"
              >
                Book Now
              </button>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="input-field"
                    value={bookingData.scheduledDateTime}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      scheduledDateTime: e.target.value
                    }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Any specific requirements or instructions..."
                    value={bookingData.customerNotes}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerNotes: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter coupon code"
                    value={bookingData.couponCode}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      couponCode: e.target.value
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Try "FIRST10" for 10% off your first booking
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    className="input-field"
                    value={bookingData.paymentMethod}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      paymentMethod: e.target.value
                    }))}
                  >
                    <option value="online">Online Payment (Card/UPI)</option>
                    {user?.wallet?.balance >= calculateAdvanceAmount() && (
                      <option value="wallet">Wallet (Balance: {formatCurrency(user.wallet.balance)})</option>
                    )}
                  </p>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Service Price:</span>
                    <span>{formatCurrency(service.pricing.basePrice)}</span>
                  </div>
                  {bookingData.couponCode === 'FIRST10' && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (10%):</span>
                      <span>-{formatCurrency(service.pricing.basePrice * 0.1)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(calculateTotalAmount())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary-600">
                    <span>Advance Payment ({service.pricing.advancePayment}%):</span>
                    <span>{formatCurrency(calculateAdvanceAmount())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Remaining (After Service):</span>
                    <span>{formatCurrency(calculateTotalAmount() - calculateAdvanceAmount())}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  > 
                    {bookingLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Booking...</span>
                      </div>
                    ) : (
                      `Pay ${formatCurrency(calculateAdvanceAmount())}`
                    )} 
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contact Support */}
          <div className="card text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Have questions about this service? Our support team is here to help.
            </p>
            <button className="btn-outline w-full">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;