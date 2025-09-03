import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  User, 
  LogOut, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';

const Layout = ({ children }) => {
  const { employee, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'busy': return <Clock className="w-4 h-4" />;
      case 'offline': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ServicePro</span>
              </Link>
            </div>

            {/* Employee Info */}
            <div className="flex items-center space-x-4">
              {/* Status Badge */}
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(employee?.availabilityStatus)}`}>
                {getStatusIcon(employee?.availabilityStatus)}
                <span className="capitalize">{employee?.availabilityStatus}</span>
              </div>

              {/* Employee Name */}
              <span className="text-sm font-medium text-gray-700">
                {employee?.name}
              </span>

              {/* Profile Link */}
              <Link
                to="/profile"
                className={`p-2 rounded-lg transition-colors ${
                  location.pathname === '/profile'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className={`inline-flex items-center px-1 pt-1 pb-4 border-b-2 text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            
            <Link
              to="/transactions"
              className={`inline-flex items-center px-1 pt-1 pb-4 border-b-2 text-sm font-medium transition-colors ${
                location.pathname === '/transactions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Transactions
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;