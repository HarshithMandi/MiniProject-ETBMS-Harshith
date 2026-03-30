import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { eventApi } from '../api/endpoints.js';
import { useBooking } from '../hooks/useBooking.js';
import { formatDate, formatCurrency } from '../utils/helpers.js';
import { Loader, ErrorMessage } from '../components/Loader.jsx';
import { ROLES, normalizeRole } from '../utils/constants.js';
import { getToken } from '../utils/token.js';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const userRole = normalizeRole(user?.role);
  const { updateBooking } = useBooking();
  const { data: event, loading, error } = useFetch(() => eventApi.getEvent(id), [id]);

  const handleBookingStart = () => {
    const token = getToken();

    if (!token || !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (userRole === ROLES.ORGANIZER) {
      navigate(`/organizer/events/${id}/manage`);
      return;
    }

    updateBooking({
      eventId: id,
      event: event,
    });
    navigate(`/events/${id}/seats`);
  };

  if (loading) return <Loader message="Loading event details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <ErrorMessage message="Event not found" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="opacity-80">Date & Time</span>
                <p className="font-bold">{formatDate(event.date)}</p>
              </div>
              <div>
                <span className="opacity-80">Venue</span>
                <p className="font-bold">{event.venue}</p>
              </div>
              <div>
                <span className="opacity-80">Total Seats</span>
                <p className="font-bold">{event.total_seats}</p>
              </div>
              <div>
                <span className="opacity-80">Ticket Price</span>
                <p className="font-bold">{formatCurrency(event.ticket_price || 500)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-gray-700 mb-6">
                {event.description || 'Join us for an amazing event! This is a great opportunity to experience live entertainment.'}
              </p>

              <h3 className="text-xl font-bold mb-3">Event Details</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Organizer:</strong> {event.organizer_id || 'Unknown'}
                </p>
                <p>
                  <strong>Category:</strong> {event.category || 'Entertainment'}
                </p>
                <p>
                  <strong>Available Seats:</strong> {event.total_seats}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Ticket Details</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Price per ticket</span>
                  <span className="font-bold">{formatCurrency(event.ticket_price || 500)}</span>
                </div>
                <div className="border-t border-gray-200"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Available Seats</span>
                  <span className="font-bold text-indigo-600">{event.total_seats}</span>
                </div>
              </div>

              {isAuthenticated && userRole === ROLES.ORGANIZER ? (
                <button
                  onClick={handleBookingStart}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Manage Event
                </button>
              ) : isAuthenticated && userRole === ROLES.CUSTOMER ? (
                <button
                  onClick={handleBookingStart}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                >
                  Book Tickets
                </button>
              ) : (
                <button
                  onClick={handleBookingStart}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                >
                  Login to Book
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
