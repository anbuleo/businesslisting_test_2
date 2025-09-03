import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, MessageCircle } from 'lucide-react';

const EmployeeTracker = ({ booking }) => {
  const [employeeLocation, setEmployeeLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }

    // Simulate employee location updates (in real app, this would come from Socket.IO)
    const interval = setInterval(() => {
      // Simulate employee moving towards user location
      if (booking.employeeDetails?.location) {
        const [lng, lat] = booking.employeeDetails.location;
        setEmployeeLocation({ lat, lng });
        
        if (userLocation) {
          const dist = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            lat, 
            lng
          );
          setDistance(dist);
          setEstimatedArrival(Math.ceil(dist / 0.5)); // Assuming 30 km/h average speed
        }
      }
      setLoading(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [booking, userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Employee Location</h3>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Employee Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-lg font-medium text-primary-600">
            {booking.employeeDetails?.name?.charAt(0) || 'E'}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {booking.employeeDetails?.name || 'Employee'}
          </h4>
          <p className="text-sm text-gray-600">
            {booking.employeeDetails?.phone || 'Phone not available'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Location Info */}
      <div className="space-y-3">
        {distance !== null && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Distance</span>
            </div>
            <span className="text-sm font-bold text-blue-900">
              {distance.toFixed(1)} km away
            </span>
          </div>
        )}

        {estimatedArrival && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">ETA</span>
            </div>
            <span className="text-sm font-bold text-green-900">
              ~{estimatedArrival} minutes
            </span>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Status</span>
          </div>
          <span className="text-sm font-medium text-gray-900 capitalize">
            {booking.status === 'accepted' ? 'On the way' : 
             booking.status === 'in_progress' ? 'At location' : 
             booking.status}
          </span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Live tracking map</p>
          <p className="text-xs text-gray-500">
            Employee location updates in real-time
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="btn-outline flex items-center justify-center space-x-2">
          <Phone className="w-4 h-4" />
          <span>Call</span>
        </button>
        <button className="btn-primary flex items-center justify-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeTracker;