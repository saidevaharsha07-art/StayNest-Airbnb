import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import BookingPage from './pages/BookingPage';
import AddPropertyPage from './pages/AddPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import MyBookingsPage from './pages/MyBookingsPage';
import HostDashboardPage from './pages/HostDashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Browsing Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Guest & User Routes */}
            <Route
              path="/book/:propertyId"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Host Routes */}
            <Route
              path="/host/properties/new"
              element={
                <ProtectedRoute>
                  <AddPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/properties/:id/edit"
              element={
                <ProtectedRoute>
                  <EditPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/dashboard"
              element={
                <ProtectedRoute>
                  <HostDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
