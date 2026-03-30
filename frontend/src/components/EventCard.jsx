import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, getEventStatus } from '../utils/helpers.js';

export const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const status = getEventStatus(event.date);
  const statusColor = status === 'Past' ? 'red' : status === 'Today' ? 'yellow' : 'green';

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/events/${event._id}`);
  };

  return (
    <div 
      onClick={() => navigate(`/events/${event._id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
    >
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-40 flex items-center justify-center text-white text-4xl">
        Event
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {event.title}
          </h3>
          <span className={`text-xs font-bold px-2 py-1 rounded bg-${statusColor}-100 text-${statusColor}-800`}>
            {status}
          </span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          Venue: {event.venue}
        </p>
        <p className="text-gray-600 text-sm mb-3">
          Date: {formatDate(event.date)}
        </p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {event.total_seats} seats
          </span>
          <button 
            onClick={handleViewDetails}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
