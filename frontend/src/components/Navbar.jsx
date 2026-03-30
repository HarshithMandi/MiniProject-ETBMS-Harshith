import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES, normalizeRole } from '../utils/constants.js';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const userRole = normalizeRole(user?.role);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowMenu(false);
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🎫 TicketHub
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          {isAuthenticated ? (
            <>
              <Link to="/" className="hover:text-indigo-200">
                Browse Events
              </Link>
              {userRole === ROLES.ORGANIZER && (
                <Link to="/organizer" className="hover:text-indigo-200">
                  Dashboard
                </Link>
              )}
              {userRole === ROLES.ADMIN && (
                <Link to="/admin" className="hover:text-indigo-200">
                  Admin
                </Link>
              )}
              {userRole === ROLES.CUSTOMER && (
                <Link to="/my-bookings" className="hover:text-indigo-200">
                  My Bookings
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 hover:text-indigo-200"
                >
                  <span>{user?.email}</span>
                  <span>▼</span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded shadow-lg w-48 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-200">
                Login
              </Link>
              <Link to="/register" className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-indigo-100">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {showMenu && (
        <div className="md:hidden bg-indigo-700 px-4 py-4 space-y-2">
          <Link to="/" className="block hover:text-indigo-200" onClick={() => setShowMenu(false)}>
            Browse Events
          </Link>
          {isAuthenticated && (
            <>
              {userRole === ROLES.ORGANIZER && (
                <Link to="/organizer" className="block hover:text-indigo-200" onClick={() => setShowMenu(false)}>
                  Dashboard
                </Link>
              )}
              {userRole === ROLES.ADMIN && (
                <Link to="/admin" className="block hover:text-indigo-200" onClick={() => setShowMenu(false)}>
                  Admin
                </Link>
              )}
              {userRole === ROLES.CUSTOMER && (
                <Link to="/my-bookings" className="block hover:text-indigo-200" onClick={() => setShowMenu(false)}>
                  My Bookings
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left hover:text-indigo-200"
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="block hover:text-indigo-200" onClick={() => setShowMenu(false)}>
                Login
              </Link>
              <Link to="/register" className="block hover:text-indigo-200" onClick={() => setShowMenu(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
