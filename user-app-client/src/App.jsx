import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CategoryServices from './pages/CategoryServices';
import ServiceDetails from './pages/ServiceDetails';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import UserTransactions from './pages/UserTransactions';
import Support from './pages/Support';
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" /> : children;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/category/:slug" element={
                <ProtectedRoute>
                  <Layout>
                    <CategoryServices />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/service/:slug" element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceDetails />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <Layout>
                    <Bookings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/booking/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <BookingDetails />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <Layout>
                    <UserTransactions />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/support" element={
                <ProtectedRoute>
                  <Layout>
                    <Support />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;