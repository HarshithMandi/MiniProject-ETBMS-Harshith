import { useContext } from 'react';
import { BookingContext } from '../context/BookingContext.jsx';

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
