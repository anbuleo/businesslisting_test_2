import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Star,
  Calendar,
  CheckCircle,
  Settings,
  Wallet,
  CreditCard,
  ArrowUpCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

const Profile = () => {
  const { employee, updateAvailability, getWalletBalance, requestWithdrawal, getWithdrawalInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [withdrawalInfo, setWithdrawalInfo] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankAccount: ''
  });
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');

  React.useEffect(() => {
    fetchWalletData();
    fetchWithdrawalInfo();
  }, []);

  const fetchWalletData = async () => {
    const result = await getWalletBalance();
    if (result.success) {
      setWalletData(result.data);
    }
  };

  const fetchWithdrawalInfo = async () => {
    const result = await getWithdrawalInfo();
    if (result.success) {
      setWithdrawalInfo(result.data);
    }
  };

  const handleAvailabilityChange = async (newStatus) => {
    setLoading(true);
    await updateAvailability(newStatus);
    setLoading(false);
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setWithdrawalLoading(true);
    setWithdrawalError('');
    setWithdrawalSuccess('');

    const result = await requestWithdrawal(
      parseFloat(withdrawalForm.amount),
      withdrawalForm.bankAccount
    );

    if (result.success) {
      setWithdrawalSuccess(`Withdrawal request submitted successfully! Transaction ID: ${result.data.transactionId}`);
      setWithdrawalForm({ amount: '', bankAccount: '' });
      setShowWithdrawModal(false);
      fetchWalletData(); // Refresh wallet data
    } else {
      setWithdrawalError(result.message);
      if (result.errors && result.errors.length > 0) {
        setWithdrawalError(result.errors.join(', '));
      }
    }

    setWithdrawalLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your profile information and availability settings.
        </p>
      </div>

      {/* Success Message */}
      {withdrawalSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700">{withdrawalSuccess}</span>
          <button
            onClick={() => setWithdrawalSuccess('')}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{employee?.name}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(employee?.availabilityStatus)}`}>
                  <span className="capitalize">{employee?.availabilityStatus}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{employee?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{employee?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joined</label>
                    <p className="text-gray-900">{formatDate(employee?.joinedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Location Update</label>
                    <p className="text-gray-900">
                      {employee?.lastLocationUpdate 
                        ? new Date(employee.lastLocationUpdate).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Types */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Types</h3>
            <div className="flex flex-wrap gap-2">
              {employee?.serviceTypes?.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {service.charAt(0).toUpperCase() + service.slice(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Availability Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['available', 'busy', 'offline'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleAvailabilityChange(status)}
                      disabled={loading || employee?.availabilityStatus === status}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        employee?.availabilityStatus === status
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {status === 'available' && <CheckCircle className="w-4 h-4" />}
                        {status === 'busy' && <Clock className="w-4 h-4" />}
                        {status === 'offline' && <Settings className="w-4 h-4" />}
                        <span className="capitalize">{status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Updating...</span>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-primary-600" />
                <span>Wallet</span>
              </h3>
              <Link
                to="/transactions"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All Transactions
              </Link>
            </div>

            {walletData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary-100 text-sm">Current Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(walletData.balance)}</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-primary-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Available for Withdrawal</p>
                        <p className="text-2xl font-bold">{formatCurrency(walletData.availableForWithdrawal)}</p>
                      </div>
                      <ArrowUpCircle className="w-8 h-8 text-green-200" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Earnings:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(walletData.totalEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Withdrawals:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(walletData.totalWithdrawals)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={!walletData.canWithdrawToday || walletData.availableForWithdrawal <= 0}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>Withdraw Funds</span>
                  </button>
                  
                  {!walletData.canWithdrawToday && (
                    <p className="text-xs text-red-600 mt-2 text-center">
                      You can only withdraw once per day. Last withdrawal: {new Date(walletData.lastWithdrawalDate).toLocaleDateString()}
                    </p>
                  )}
                  
                  {walletData.availableForWithdrawal <= 0 && walletData.canWithdrawToday && (
                    <p className="text-xs text-yellow-600 mt-2 text-center">
                      Minimum balance of ₹500 must be maintained
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Rating</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {employee?.rating ? `${employee.rating.toFixed(1)}/5` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Total Jobs</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {employee?.totalJobs || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Active Bookings</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {employee?.assignedBookings?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verification</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  employee?.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {employee?.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="text-sm font-medium text-gray-900">Partner</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left">
                Update Profile
              </button>
              <button className="w-full btn-secondary text-left">
                Change Password
              </button>
              <button className="w-full btn-secondary text-left">
                Notification Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawalError('');
                  setWithdrawalForm({ amount: '', bankAccount: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {withdrawalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{withdrawalError}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max={walletData?.availableForWithdrawal || 0}
                    step="0.01"
                    required
                    className="input-field pl-10"
                    placeholder="Enter amount"
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {walletData ? formatCurrency(walletData.availableForWithdrawal) : '₹0'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your bank account number"
                  value={withdrawalForm.bankAccount}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bankAccount: e.target.value }))}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Withdrawal Information:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Processing time: 2-3 business days</li>
                    <li>• Minimum balance of ₹500 will be maintained</li>
                    <li>• Only one withdrawal per day allowed</li>
                    <li>• No processing fees</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawalError('');
                    setWithdrawalForm({ amount: '', bankAccount: '' });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawalLoading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawalLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Withdraw'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;