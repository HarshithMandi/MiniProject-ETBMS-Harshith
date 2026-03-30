import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { BookingProvider } from './context/BookingContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ROLES } from './utils/constants.js';

// Pages
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Events } from './pages/Events.jsx';
import { EventDetails } from './pages/EventDetails.jsx';
import { SeatSelection } from './pages/SeatSelection.jsx';
import { Payment } from './pages/Payment.jsx';
import { MyBookings } from './pages/MyBookings.jsx';
import { OrganizerDashboard } from './pages/OrganizerDashboard.jsx';
import { ManageEvent } from './pages/ManageEvent.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { Profile } from './pages/Profile.jsx';

// Styles
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Events />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events/:id" element={<EventDetails />} />

              {/* Protected Routes - All Authenticated Users */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Customer Routes */}
              <Route
                path="/events/:id/seats"
                element={
                  <ProtectedRoute requiredRole={ROLES.CUSTOMER}>
                    <SeatSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/payment"
                element={
                  <ProtectedRoute requiredRole={ROLES.CUSTOMER}>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute requiredRole={ROLES.CUSTOMER}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Organizer Routes */}
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute requiredRole={ROLES.ORGANIZER}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/events/:id/manage"
                element={
                  <ProtectedRoute requiredRole={ROLES.ORGANIZER}>
                    <ManageEvent />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
