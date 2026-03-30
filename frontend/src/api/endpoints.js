import axiosInstance from './axiosInstance.js';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getProfile: () => axiosInstance.get('/auth/me'),
  logout: () => axiosInstance.post('/auth/logout'),
};

export const userApi = {
  getUsers: () => axiosInstance.get('/users'),
  getUser: (id) => axiosInstance.get(`/users/${id}`),
  updateUser: (id, data) => axiosInstance.put(`/users/${id}`, data),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
};

export const eventApi = {
  getEvents: (params) => axiosInstance.get('/events', { params }),
  getEvent: (id) => axiosInstance.get(`/events/${id}`),
  createEvent: (data) => axiosInstance.post('/events', data),
  updateEvent: (id, data) => axiosInstance.put(`/events/${id}`, data),
  deleteEvent: (id) => axiosInstance.delete(`/events/${id}`),
  getEventSeats: (id) => axiosInstance.get(`/events/${id}/seats`),
};

export const seatApi = {
  lockSeats: (data) => axiosInstance.post('/seats/lock', data),
  releaseSeats: (data) => axiosInstance.post('/seats/release', data),
  getSeats: (eventId) => axiosInstance.get(`/events/${eventId}/seats`),
};

export const bookingApi = {
  createBooking: (data) => axiosInstance.post('/bookings', data),
  getBooking: (id) => axiosInstance.get(`/bookings/${id}`),
  getMyBookings: () => axiosInstance.get('/bookings/my'),
  confirmBooking: (id) => axiosInstance.put(`/bookings/${id}/confirm`, {}),
  cancelBooking: (id) => axiosInstance.delete(`/bookings/${id}`),
};

export const paymentApi = {
  processPayment: (data) => axiosInstance.post('/payments', data),
  getPayment: (id) => axiosInstance.get(`/payments/${id}`),
};

export const adminApi = {
  getReports: () => axiosInstance.get('/admin/reports'),
  getUsers: () => axiosInstance.get('/admin/users'),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
};
