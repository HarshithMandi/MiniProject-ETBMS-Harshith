import React, { createContext, useState, useCallback } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState({
    eventId: null,
    event: null,
    selectedSeats: [],
    totalPrice: 0,
    lockedSeats: [],
  });

  const [bookingHistory, setBookingHistory] = useState([]);

  const updateBooking = useCallback((updates) => {
    setCurrentBooking((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const addSelectedSeat = useCallback((seat, price) => {
    setCurrentBooking((prev) => {
      const isSelected = prev.selectedSeats.some((s) => s._id === seat._id);
      if (isSelected) {
        return {
          ...prev,
          selectedSeats: prev.selectedSeats.filter((s) => s._id !== seat._id),
          totalPrice: prev.totalPrice - price,
        };
      }
      return {
        ...prev,
        selectedSeats: [...prev.selectedSeats, seat],
        totalPrice: prev.totalPrice + price,
      };
    });
  }, []);

  const clearBooking = useCallback(() => {
    setCurrentBooking({
      eventId: null,
      event: null,
      selectedSeats: [],
      totalPrice: 0,
      lockedSeats: [],
    });
  }, []);

  const value = {
    currentBooking,
    bookingHistory,
    updateBooking,
    addSelectedSeat,
    clearBooking,
    setBookingHistory,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
