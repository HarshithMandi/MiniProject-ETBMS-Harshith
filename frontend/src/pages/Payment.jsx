import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking.js';
import { bookingApi, paymentApi } from '../api/endpoints.js';
import { ErrorMessage, SuccessMessage, Loader } from '../components/Loader.jsx';
import { formatCurrency } from '../utils/helpers.js';

export const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBooking, clearBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCardDetails = () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 13) {
      setMessage('Invalid card number');
      return false;
    }
    if (!cardDetails.cardHolder || cardDetails.cardHolder.length < 3) {
      setMessage('Invalid card holder name');
      return false;
    }
    if (!cardDetails.expiryDate || cardDetails.expiryDate.length !== 5) {
      setMessage('Invalid expiry date (MM/YY)');
      return false;
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      setMessage('Invalid CVV');
      return false;
    }
    return true;
  };

  const getApiErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    const detail = data?.detail;

    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const msgs = detail
        .map((d) => (typeof d?.msg === 'string' ? d.msg : null))
        .filter(Boolean);
      if (msgs.length > 0) return msgs.join(', ');
      try {
        return JSON.stringify(detail);
      } catch {
        return fallback;
      }
    }
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    if (typeof err?.message === 'string' && err.message.trim()) return err.message;

    return fallback;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateCardDetails()) return;
    if (currentBooking.selectedSeats.length === 0) {
      setMessage('No seats selected');
      return;
    }

    try {
      setLoading(true);

      const eventId = currentBooking.eventId || id;
      if (!eventId) {
        setMessage('Missing event information. Please go back and try again.');
        setLoading(false);
        return;
      }

      // Create booking first
      let booking;
      try {
        const bookingResponse = await bookingApi.createBooking({
          event_id: eventId,
          seat_numbers: currentBooking.selectedSeats.map((s) => s.seat_number),
        });
        booking = bookingResponse.data;
      } catch (bookingErr) {
        console.error('Booking creation error:', bookingErr);
        setMessage(`Error creating booking: ${getApiErrorMessage(bookingErr, 'Failed to create booking')}`);
        setLoading(false);
        return;
      }

      const bookingId = booking?.id || booking?._id;
      if (!bookingId) {
        setMessage('Booking was created, but no booking ID was returned.');
        setLoading(false);
        return;
      }

      // Process payment
      let paymentResponse;
      try {
        paymentResponse = await paymentApi.processPayment({
          booking_id: bookingId,
          amount: currentBooking.totalPrice,
        });
      } catch (paymentErr) {
        console.error('Payment error:', paymentErr);
        setMessage(`Error processing payment: ${getApiErrorMessage(paymentErr, 'Failed to process payment')}`);
        setLoading(false);
        return;
      }

      // Payment successful - confirm booking
      if (paymentResponse.data) {
        try {
          await bookingApi.confirmBooking(bookingId);
        } catch (confirmErr) {
          console.warn('Booking confirmation had an issue, but payment succeeded', confirmErr);
        }

        setMessage('Payment successful! Your tickets have been booked.');
        clearBooking();

        setTimeout(() => {
          navigate('/my-bookings', { replace: true });
        }, 2000);
      } else {
        setMessage('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected payment error:', err);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentBooking.selectedSeats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">No Booking Selected</h1>
          <p className="text-gray-600 mb-4">
            Please go back and select seats first.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Complete Your Payment</h1>

        {message && (
          message.includes('successful') ? (
            <SuccessMessage message={message} />
          ) : message.includes('failed') ? (
            <ErrorMessage message={message} onDismiss={() => setMessage('')} />
          ) : (
            <ErrorMessage message={message} onDismiss={() => setMessage('')} />
          )
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Card Details</h2>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="12/25"
                      maxLength="5"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      maxLength="4"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? 'Processing Payment...' : 'Pay Now'}
                </button>
              </form>

              <p className="text-sm text-gray-500 mt-4">
                Use test card: 4242 4242 4242 4242 | Any expiry (future) | Any CVV
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  {currentBooking.event?.title}
                </p>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs font-mono text-gray-700">
                    Seats: {currentBooking.selectedSeats.map((s) => s.seat_number).join(', ')}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span className="font-bold">{currentBooking.selectedSeats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Price</span>
                  <span className="font-bold">
                    {formatCurrency(currentBooking.event?.ticket_price || 500)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">
                    {formatCurrency(currentBooking.totalPrice)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-indigo-600">
                  {formatCurrency(currentBooking.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
