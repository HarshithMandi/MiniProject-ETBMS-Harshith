import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { bookingApi } from '../api/endpoints.js';
import { BookingCard } from '../components/BookingCard.jsx';
import { Loader, ErrorMessage, SuccessMessage } from '../components/Loader.jsx';

export const MyBookings = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { data: bookings, loading, error } = useFetch(
    () => bookingApi.getMyBookings(),
    []
  );

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingApi.cancelBooking(bookingId);
      setMessageType('success');
      setMessage('Booking cancelled successfully');
      // Refresh bookings
      window.location.reload();
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  const handleRetryPayment = (booking) => {
    // Navigate to payment page with booking ID
    const bookingId = booking.id || booking._id;
    window.location.href = `/bookings/${bookingId}/payment`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold">My Bookings</h1>
          <p className="text-indigo-100 mt-2">View and manage your event bookings</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {message && (
          messageType === 'success' ? (
            <SuccessMessage message={message} onDismiss={() => setMessage('')} />
          ) : (
            <ErrorMessage message={message} onDismiss={() => setMessage('')} />
          )
        )}

        {loading ? (
          <Loader message="Loading your bookings..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id || booking._id}
                booking={booking}
                onCancel={handleCancelBooking}
                onRetry={handleRetryPayment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't booked any tickets yet. Browse events and book your first ticket!
            </p>
            <a
              href="/"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700"
            >
              Browse Events
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
