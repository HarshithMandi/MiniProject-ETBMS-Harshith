// Utility constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  CUSTOMER: 'customer'
};

export const normalizeRole = (role) => (typeof role === 'string' ? role.trim().toLowerCase() : '');

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
};

export const SEAT_STATUS = {
  AVAILABLE: 'available',
  LOCKED: 'locked',
  BOOKED: 'booked'
};

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed'
};

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';
