import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { eventApi } from '../api/endpoints.js';
import { Loader, ErrorMessage } from '../components/Loader.jsx';
import { EventCard } from '../components/EventCard.jsx';

export const OrganizerDashboard = () => {
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    date: '',
    total_seats: '',
    ticket_price: '',
    description: '',
  });

  const { data: events, loading, error } = useFetch(
    () => eventApi.getEvents({}),
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventApi.createEvent({
        ...formData,
        total_seats: parseInt(formData.total_seats),
        ticket_price: parseFloat(formData.ticket_price),
      });
      setMessage('Event created successfully!');
      setFormData({
        title: '',
        venue: '',
        date: '',
        total_seats: '',
        ticket_price: '',
        description: '',
      });
      setShowCreateForm(false);
      // Refresh events
      window.location.reload();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventApi.deleteEvent(eventId);
      setMessage('Event deleted successfully!');
      window.location.reload();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold">📊 Organizer Dashboard</h1>
          <p className="text-blue-100 mt-2">Create and manage your events</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded border ${message.includes('success') ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Your Events</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create Event'}
          </button>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Total Seats
                  </label>
                  <input
                    type="number"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Ticket Price (₹)
                  </label>
                  <input
                    type="number"
                    name="ticket_price"
                    value={formData.ticket_price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
              >
                Create Event
              </button>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <Loader message="Loading your events..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="relative">
                <EventCard event={event} />
                <div className="absolute top-4 right-4 space-y-2 z-10">
                  <button
                    onClick={() => (window.location.href = `/organizer/events/${event._id}/manage`)}
                    className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
