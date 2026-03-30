import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Loader, ErrorMessage, SuccessMessage } from '../components/Loader.jsx';
import { formatDate } from '../utils/helpers.js';

export const Profile = () => {
  const { user, getProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getProfile();
      if (result.success) {
        setUserProfile(result.data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <Loader message="Loading profile..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold">👤 My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {message && (
          message.includes('success') ? (
            <SuccessMessage message={message} onDismiss={() => setMessage('')} />
          ) : (
            <ErrorMessage message={message} onDismiss={() => setMessage('')} />
          )
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Account Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 text-sm font-bold mb-2">
                  Email
                </label>
                <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded">
                  {userProfile?.email || user?.email}
                </p>
              </div>

              <div>
                <label className="block text-gray-600 text-sm font-bold mb-2">
                  Role
                </label>
                <p className="text-lg">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                    {userProfile?.role?.toUpperCase() || user?.role?.toUpperCase()}
                  </span>
                </p>
              </div>

              {userProfile?.created_at && (
                <div>
                  <label className="block text-gray-600 text-sm font-bold mb-2">
                    Account Created
                  </label>
                  <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded">
                    {formatDate(userProfile.created_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-4">Account Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Role specific info */}
        {userProfile?.role === 'customer' && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-8">
            <h3 className="text-lg font-bold text-blue-800 mb-3">🎫 Customer Benefits</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>✓ Browse and search events</li>
              <li>✓ Select and lock seats</li>
              <li>✓ Secure payment processing</li>
              <li>✓ View booking history</li>
              <li>✓ Cancel bookings</li>
            </ul>
          </div>
        )}

        {userProfile?.role === 'organizer' && (
          <div className="bg-green-50 rounded-lg border border-green-200 p-6 mt-8">
            <h3 className="text-lg font-bold text-green-800 mb-3">🎭 Organizer Features</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>✓ Create new events</li>
              <li>✓ Manage event details</li>
              <li>✓ Configure seats</li>
              <li>✓ Track bookings</li>
              <li>✓ View analytics</li>
            </ul>
          </div>
        )}

        {userProfile?.role === 'admin' && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6 mt-8">
            <h3 className="text-lg font-bold text-red-800 mb-3">🔐 Admin Privileges</h3>
            <ul className="space-y-2 text-sm text-red-700">
              <li>✓ View system reports</li>
              <li>✓ Monitor revenue</li>
              <li>✓ Manage users</li>
              <li>✓ View payment analytics</li>
              <li>✓ System configuration</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
