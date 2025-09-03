import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const response = await axios.get('/api/auth/profile');
          setUser(response.data.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('userToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { user: userData, token } = response.data.data;
      
      // Store token
      localStorage.setItem('userToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      console.log(response)
      
      const { user: newUser, token } = response?.data?.data;
      
      // Store token
      localStorage.setItem('userToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateLocation = async (longitude, latitude, address) => {
    try {
      const response = await axios.put('/api/users/location', {
        longitude,
        latitude,
        address
      });
      
      // Update user data with new location info
      setUser(prev => ({
        ...prev,
        location: response.data.data.location,
        address: response.data.data.address,
        lastLocationUpdate: response.data.data.lastLocationUpdate
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Location update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Location update failed' 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/profile', profileData);
      
      // Update user data
      setUser(prev => ({
        ...prev,
        ...response.data.data
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const getUserWalletBalance = async () => {
    try {
      const response = await axios.get('/api/user/wallet/balance');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Get user wallet balance error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch user wallet balance' 
      };
    }
  };

  const topUpUserWallet = async (amount, paymentMethod) => {
    try {
      const response = await axios.post('/api/user/wallet/topup', { amount, paymentMethod });
      // Update user object with new balance
      setUser(prev => ({ ...prev, wallet: { ...prev.wallet, balance: response.data.data.newBalance } }));
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Top up user wallet error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to top up wallet' 
      };
    }
  };

  const getUserWalletTransactions = async (page = 1, limit = 20, type = '', status = '') => {
    try {
      const response = await axios.get(`/api/user/wallet/transactions?page=${page}&limit=${limit}&type=${type}&status=${status}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Get user wallet transactions error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch user wallet transactions' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateLocation, // Keep this for location updates
    updateProfile, // Keep this for general profile updates
    getUserWalletBalance,
    topUpUserWallet,
    getUserWalletTransactions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};