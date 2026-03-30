import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { eventApi, seatApi } from '../api/endpoints.js';
import { Loader, ErrorMessage, SuccessMessage } from '../components/Loader.jsx';
import { formatDate } from '../utils/helpers.js';

export const ManageEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [edit, setEdit] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: event, loading: eventLoading, error: eventError } = useFetch(
    () => eventApi.getEvent(id),
    [id]
  );

  const { data: seats, loading: seatsLoading } = useFetch(
    () => eventApi.getEventSeats(id),
    [id]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_seats' ? parseInt(value, 10) : name === 'ticket_price' ? parseFloat(value) : value,
    }));
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventApi.updateEvent(id, formData);
      setMessageType('success');
      setMessage('Event updated successfully!');
      setEdit(false);
      // Refresh
      window.location.reload();
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.detail || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventApi.deleteEvent(id);
      setMessageType('success');
      setMessage('Event deleted successfully! Redirecting...');
      setTimeout(() => {
        navigate('/organizer');
      }, 2000);
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.detail || 'Failed to delete event');
    }
  };

  if (eventLoading) return <Loader message="Loading event details..." />;
  if (eventError) return <ErrorMessage message={eventError} />;
  if (!event) return <ErrorMessage message="Event not found" />;

  const seatStats = {
    available: seats?.filter((s) => s.status === 'available').length || 0,
    booked: seats?.filter((s) => s.status === 'booked').length || 0,
    locked: seats?.filter((s) => s.status === 'locked').length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-blue-100 mt-2">Manage event details and seats</p>
            </div>
            <button
              onClick={() => navigate('/organizer')}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50"
            >
              Back to Events
            </button>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Event Details</h2>
                <button
                  onClick={() => {
                    setEdit(!edit);
                    if (!edit) {
                      setFormData({
                        title: event.title,
                        venue: event.venue,
                        date: event.date,
                        total_seats: event.total_seats,
                        ticket_price: event.ticket_price,
                        description: event.description,
                      });
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {edit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {!edit ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-600 text-sm font-bold">Title</label>
                    <p className="text-gray-800 text-lg">{event.title}</p>
                  </div>

                  <div>
                    <label className="block text-gray-600 text-sm font-bold">Venue</label>
                    <p className="text-gray-800 text-lg">{event.venue}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm font-bold">Date & Time</label>
                      <p className="text-gray-800">{formatDate(event.date)}</p>
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-bold">Total Seats</label>
                      <p className="text-gray-800 text-lg">{event.total_seats}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 text-sm font-bold">Description</label>
                    <p className="text-gray-800">{event.description || 'No description'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateEvent} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Venue</label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Date & Time</label>
                      <input
                        type="datetime-local"
                        name="date"
                        value={formData.date || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Total Seats</label>
                      <input
                        type="number"
                        name="total_seats"
                        value={formData.total_seats || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Ticket Price</label>
                    <input
                      type="number"
                      name="ticket_price"
                      value={formData.ticket_price || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </form>
              )}
            </div>

            {/* Delete Event */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-800 mb-3">Danger Zone</h3>
              <button
                onClick={handleDeleteEvent}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>

          {/* Sidebar - Seat Statistics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Seat Statistics</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <p className="text-green-600 font-semibold text-sm">Available</p>
                  <p className="text-2xl font-bold text-green-700">{seatStats.available}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <p className="text-blue-600 font-semibold text-sm">Locked</p>
                  <p className="text-2xl font-bold text-blue-700">{seatStats.locked}</p>
                </div>

                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <p className="text-red-600 font-semibold text-sm">Booked</p>
                  <p className="text-2xl font-bold text-red-700">{seatStats.booked}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-gray-600 font-semibold text-sm">Total</p>
                  <p className="text-2xl font-bold text-gray-700">{event.total_seats}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>Edit event details anytime</li>
                <li>Monitor seat availability</li>
                <li>Lock seats to prevent double booking</li>
                <li>Only admins can delete users</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
