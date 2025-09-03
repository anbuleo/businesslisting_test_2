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
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/employees/profile');
          setEmployee(response.data.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/employees/login', {
        email,
        password
      });

      const { data, token } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set employee data
      setEmployee(data);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (employeeData) => {
    try {
      const response = await axios.post('/api/employees/register', employeeData);
      
      const { data, token } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set employee data
      setEmployee(data);
      
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
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setEmployee(null);
  };

  const updateLocation = async (longitude, latitude, availabilityStatus) => {
    try {
      const response = await axios.put('/api/employees/location', {
        longitude,
        latitude,
        availabilityStatus
      });
      
      // Update employee data with new location info
      setEmployee(prev => ({
        ...prev,
        location: response.data.data.location,
        availabilityStatus: response.data.data.availabilityStatus,
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

  const updateAvailability = async (availabilityStatus) => {
    try {
      const response = await axios.put('/api/employees/availability', {
        availabilityStatus
      });
      
      // Update employee data
      setEmployee(prev => ({
        ...prev,
        availabilityStatus: response.data.data.availabilityStatus
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Availability update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Availability update failed' 
      };
    }
  };

  const getWalletBalance = async () => {
    try {
      const response = await axios.get('/api/wallet/balance');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Get wallet balance error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch wallet balance' 
      };
    }
  };

  const getWalletTransactions = async (page = 1, limit = 20) => {
    try {
      const response = await axios.get(`/api/wallet/transactions?page=${page}&limit=${limit}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Get wallet transactions error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch transactions' 
      };
    }
  };

  const requestWithdrawal = async (amount, bankAccount) => {
    try {
      const response = await axios.post('/api/wallet/withdraw', {
        amount,
        bankAccount
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Withdrawal request error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Withdrawal request failed',
        errors: error.response?.data?.errors || []
      };
    }
  };

  const getWithdrawalInfo = async () => {
    try {
      const response = await axios.get('/api/wallet/withdrawal-info');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Get withdrawal info error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch withdrawal info' 
      };
    }
  };

  const value = {
    employee,
    loading,
    login,
    register,
    logout,
    updateLocation,
    updateAvailability,
    getWalletBalance,
    getWalletTransactions,
    requestWithdrawal,
    getWithdrawalInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};