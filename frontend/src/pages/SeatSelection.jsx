import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { useBooking } from '../hooks/useBooking.js';
import { eventApi, seatApi } from '../api/endpoints.js';
import { SeatGrid } from '../components/SeatGrid.jsx';
import { Loader, ErrorMessage, SuccessMessage } from '../components/Loader.jsx';
import { formatCurrency } from '../utils/helpers.js';

export const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBooking, updateBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { data: event } = useFetch(() => eventApi.getEvent(id), [id]);
  const { data: seats, loading: seatsLoading, error: seatsError } = useFetch(
    () => eventApi.getEventSeats(id),
    [id]
  );

  const handleSeatClick = (seat) => {
    const isSelected = currentBooking.selectedSeats.some((s) => s._id === seat._id);
    const ticketPrice = event?.ticket_price || 500;

    if (isSelected) {
      updateBooking({
        selectedSeats: currentBooking.selectedSeats.filter((s) => s._id !== seat._id),
        totalPrice: currentBooking.totalPrice - ticketPrice,
      });
    } else {
      updateBooking({
        selectedSeats: [...currentBooking.selectedSeats, seat],
        totalPrice: currentBooking.totalPrice + ticketPrice,
      });
    }
  };

  const handleProceedToPayment = async () => {
    if (currentBooking.selectedSeats.length === 0) {
      setMessage('Please select at least one seat');
      return;
    }

    try {
      setLoading(true);
      // Try to lock the selected seats
      try {
        await seatApi.lockSeats({
          event_id: id,
          seat_numbers: currentBooking.selectedSeats.map((s) => s.seat_number),
        });
        setMessage('Seats locked! Proceeding to payment...');
      } catch (lockErr) {
        // If locking fails, proceed anyway (fallback for when seat service is unavailable)
        console.warn('Seat locking failed, proceeding to payment anyway', lockErr);
        setMessage('Proceeding to payment...');
      }

      setTimeout(() => {
        navigate(`/events/${id}/payment`);
      }, 1200);
    } catch (err) {
      setMessage('An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (seatsLoading) return <Loader message="Loading seats..." />;
  if (seatsError) return <ErrorMessage message={seatsError} />;
  if (!seats) return <ErrorMessage message="No seats available" />;

  const ticketPrice = event?.ticket_price || 500;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{event?.title}</h1>
        <p className="text-gray-600 mb-8">Select your seats below</p>

        {message && (
          message.includes('Failed') ? (
            <ErrorMessage message={message} onDismiss={() => setMessage('')} />
          ) : (
            <SuccessMessage message={message} onDismiss={() => setMessage('')} />
          )
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Grid */}
          <div className="lg:col-span-2">
            {seats && seats.length > 0 ? (
              <SeatGrid
                seats={seats}
                selectedSeats={currentBooking.selectedSeats}
                onSeatClick={handleSeatClick}
                ticketPrice={ticketPrice}
              />
            ) : (
              <ErrorMessage message="No seats available for this event" />
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-8">
            <h3 className="text-xl font-bold mb-4">Booking Summary</h3>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span>Selected Seats</span>
                <span className="font-bold">{currentBooking.selectedSeats.length}</span>
              </div>
              {currentBooking.selectedSeats.length > 0 && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-mono text-gray-700">
                    {currentBooking.selectedSeats.map((s) => s.seat_number).join(', ')}
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <span>Price per ticket</span>
                <span className="font-bold">{formatCurrency(ticketPrice)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold mb-6 pb-6 border-b border-gray-200">
              <span>Total Amount</span>
              <span className="text-indigo-600">{formatCurrency(currentBooking.totalPrice)}</span>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={
                currentBooking.selectedSeats.length === 0 ||
                loading
              }
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <button
              onClick={() => navigate(`/events/${id}`)}
              className="w-full mt-2 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              Back to Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
