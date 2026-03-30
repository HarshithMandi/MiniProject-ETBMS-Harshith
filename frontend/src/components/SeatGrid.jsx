import React from 'react';
import { SEAT_STATUS } from '../utils/constants.js';

export const SeatGrid = ({ seats, selectedSeats, onSeatClick, ticketPrice }) => {
  const getSeatColor = (seatStatus) => {
    switch (seatStatus) {
      case SEAT_STATUS.AVAILABLE:
        return 'bg-green-500 hover:bg-green-600 cursor-pointer';
      case SEAT_STATUS.BOOKED:
        return 'bg-red-500 cursor-not-allowed';
      case SEAT_STATUS.LOCKED:
        return 'bg-yellow-500 cursor-not-allowed';
      default:
        return 'bg-gray-400';
    }
  };

  const isSelected = (seatId) => {
    return selectedSeats.some((s) => s._id === seatId);
  };

  // Calculate grid dimensions for a rectangular layout
  const totalSeats = seats.length;
  const columns = Math.ceil(Math.sqrt(totalSeats));
  const rows = Math.ceil(totalSeats / columns);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-center">Select Your Seats</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500 rounded"></div>
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          <span>Selected</span>
        </div>
      </div>

      {/* Seat grid - rectangular layout */}
      <div className="flex justify-center mb-6">
        <div
          className="gap-2 p-4 bg-gray-100 rounded-lg inline-block"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: '0.5rem',
          }}
        >
          {seats.map((seat) => (
            <button
              key={seat._id}
              onClick={() => onSeatClick(seat)}
              disabled={seat.status !== SEAT_STATUS.AVAILABLE}
              className={`w-10 h-10 rounded text-xs font-bold transition-all ${
                isSelected(seat._id)
                  ? 'bg-blue-500 text-white scale-110 shadow-lg'
                  : getSeatColor(seat.status)
              } ${seat.status === SEAT_STATUS.AVAILABLE ? 'text-white' : 'text-gray-700'}`}
              title={`${seat.seat_number} - ${seat.status}`}
            >
              {seat.seat_number}
            </button>
          ))}
        </div>
      </div>

      {/* Selected seats summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="font-bold mb-2">
            Selected Seats: {selectedSeats.map((s) => s.seat_number).join(', ')}
          </p>
          <p className="text-lg font-bold text-indigo-600">
            Total: ₹{selectedSeats.length * ticketPrice}
          </p>
        </div>
      )}
    </div>
  );
};
