import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  CreditCard,
  Heart,
  HelpCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || ''
    },
    preferences: {
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        sms: user?.preferences?.notifications?.sms ?? true,
        push: user?.preferences?.notifications?.push ?? true
      }
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('notifications.')) {
      const notificationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: {
            ...prev.preferences.notifications,
            [notificationField]: checked
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || ''
      },
      preferences: {
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          sms: user?.preferences?.notifications?.sms ?? true,
          push: user?.preferences?.notifications?.push ?? true
        }
      }
    });
    setEditing(false);
    setError('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences.
          </p>
        </div>
        
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700">{success}</span>
          <button
            onClick={() => setSuccess('')}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <X className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              {editing && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{user?.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="text-gray-900">
                          {user?.address?.city ? `${user.address.city}, ${user.address.state}` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {user?.address?.street && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <p className="text-gray-900">
                      {user.address.street}, {user.address.city}, {user.address.state} {user.address.zipCode}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-500">Receive booking updates via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications.email"
                    checked={editing ? formData.preferences.notifications.email : user?.preferences?.notifications?.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                    <p className="text-xs text-gray-500">Receive booking updates via SMS</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications.sms"
                    checked={editing ? formData.preferences.notifications.sms : user?.preferences?.notifications?.sms}
                    onChange={handleChange}
                    disabled={!editing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-xs text-gray-500">Receive real-time notifications in the app</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications.push"
                    checked={editing ? formData.preferences.notifications.push : user?.preferences?.notifications?.push}
                    onChange={handleChange}
                    disabled={!editing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verification</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user?.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="text-sm font-medium text-gray-900">Customer</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet</h3>
            
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm">Current Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(user?.wallet?.balance || 0)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-primary-200" />
              </div>
            </div>

            <button 
              onClick={() => alert('Top-up functionality will be implemented with a payment gateway.')}
              className="w-full btn-outline">
              Add Money
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link to="/transactions" className="w-full btn-secondary text-left flex items-center space-x-3">
                <Heart className="w-4 h-4" />
                <span>Wallet Transactions</span>
              </Link>
              
              {/* <button className="w-full btn-secondary text-left flex items-center space-x-3">
                <Heart className="w-4 h-4" />
                <span>Favorite Services</span>
              </button> */}
              
              <button className="w-full btn-secondary text-left flex items-center space-x-3">
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
              
              <button className="w-full btn-secondary text-left flex items-center space-x-3">
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;