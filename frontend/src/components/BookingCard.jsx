import React from 'react';
import { formatDate, formatCurrency } from '../utils/helpers.js';
import { BOOKING_STATUS } from '../utils/constants.js';

export const BookingCard = ({ booking, onCancel, onRetry }) => {
  const bookingId = booking.id || booking._id;

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return 'bg-green-100 text-green-800 border-green-300';
      case BOOKING_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case BOOKING_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return '✓';
      case BOOKING_STATUS.PENDING:
        return '⏳';
      case BOOKING_STATUS.CANCELLED:
        return '✕';
      default:
        return '?';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {booking.event?.title || 'Event'}
          </h3>
          <p className="text-gray-600 text-sm mb-1">
            📅 {formatDate(booking.created_at)}
          </p>
          <p className="text-gray-600 text-sm">
            🎫 Seat{booking.seat_numbers?.length > 1 ? 's' : ''}: {booking.seat_numbers?.join(', ')}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full font-bold text-sm border ${getStatusColor(
            booking.status
          )}`}
        >
          {getStatusIcon(booking.status)} {booking.status?.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-t border-gray-200">
        <div>
          <span className="text-gray-600 text-sm">Booking ID</span>
          <p className="font-mono text-sm text-gray-800">{bookingId?.slice(-8)}</p>
        </div>
        <div className="text-right">
          <span className="text-gray-600 text-sm">Amount Paid</span>
          <p className="font-bold text-lg text-indigo-600">
            {formatCurrency(booking.total_price || 0)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {booking.status === BOOKING_STATUS.PENDING && onRetry && (
          <button
            onClick={() => onRetry(booking)}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Retry Payment
          </button>
        )}
        {booking.status !== BOOKING_STATUS.CANCELLED && onCancel && (
          <button
            onClick={() => onCancel(bookingId)}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};
