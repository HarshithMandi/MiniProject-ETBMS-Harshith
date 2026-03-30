# Frontend Files & API Integration Guide

## 📋 Complete File Structure

### Frontend Root Files
```
frontend/
├── .env                           ✅ Environment variables
├── .gitignore                     ✅ Git ignore rules
├── Dockerfile                     ✅ Docker image definition
├── docker-compose.yml             ✅ Docker compose setup
├── index.html                     ✅ HTML entry point
├── package.json                   ✅ Dependencies & scripts
├── postcss.config.js              ✅ PostCSS configuration
├── tailwind.config.js             ✅ Tailwind CSS config
├── vite.config.js                 ✅ Vite build config
├── README.md                      ✅ Frontend documentation
├── IMPLEMENTATION_SUMMARY.md      ✅ Implementation overview
└── FRONTEND_API_GUIDE.md          📍 This file
```

### Source Files (src/)

#### API Layer (`src/api/`)
- **axiosInstance.js** - Axios HTTP client with JWT interceptors
  - Request interceptor: Adds JWT token to headers
  - Response interceptor: Handles 401 & redirects
  
- **endpoints.js** - Centralized API endpoints
  - `authApi` - Authentication endpoints
  - `userApi` - User management
  - `eventApi` - Event operations
  - `seatApi` - Seat management
  - `bookingApi` - Booking operations
  - `paymentApi` - Payment processing
  - `adminApi` - Admin operations

#### Components (`src/components/`)
- **Navbar.jsx** - Navigation bar with auth menu
- **ProtectedRoute.jsx** - Route guard for RBAC
- **Loader.jsx** - Loading spinner & message components
- **ErrorMessage.jsx** - Error notification display
- **SuccessMessage.jsx** - Success notification display
- **EventCard.jsx** - Event card component
- **SeatGrid.jsx** - Interactive seat selection grid
- **BookingCard.jsx** - Booking display card
- **Table.jsx** - Reusable data table

#### Context (`src/context/`)
- **AuthContext.jsx** - Global authentication state
  - User data
  - Loading state
  - Auth methods (register, login, logout, getProfile)
  
- **BookingContext.jsx** - Global booking state
  - Current booking
  - Booking history
  - Selection management

#### Hooks (`src/hooks/`)
- **useAuth.js** - Hook to access AuthContext
- **useFetch.js** - Custom hook for data fetching
- **useBooking.js** - Hook to access BookingContext

#### Pages (`src/pages/`)
- **Login.jsx** - User login page
- **Register.jsx** - User registration page
- **Events.jsx** - Event browsing & search
- **EventDetails.jsx** - Single event details
- **SeatSelection.jsx** - Interactive seat selection
- **Payment.jsx** - Payment processing & form
- **MyBookings.jsx** - User booking history
- **Profile.jsx** - User profile page
- **OrganizerDashboard.jsx** - Event creation & management
- **ManageEvent.jsx** - Event editing & details
- **AdminDashboard.jsx** - System analytics & user management

#### Utils (`src/utils/`)
- **constants.js** - App-wide constants
  - Role definitions
  - Status enums
  - API configuration
  
- **helpers.js** - Utility functions
  - `formatDate()` - Format datetime
  - `formatCurrency()` - Format currency
  - `formatTimeOnly()` - Format time
  - `getEventStatus()` - Event status
  
- **token.js** - JWT token management
  - `getToken()` - Get stored token
  - `setToken()` - Store token
  - `removeToken()` - Remove token
  - `getUser()` - Get user data
  - `setUser()` - Store user data
  - `isAuthenticated()` - Check auth status

#### Styles (`src/styles/`)
- **global.css** - Global styles & Tailwind imports

#### Root Components
- **App.jsx** - Main app with routing
- **main.jsx** - React entry point

---

## 🔌 API Integration Details

### Base Configuration

**API Endpoint:** `http://localhost:8000`

**Axios Instance** (`src/api/axiosInstance.js`):
```javascript
- baseURL: VITE_API_BASE_URL
- Content-Type: application/json
- JWT token in Authorization header
- Auto-logout on 401
```

### Authentication API

#### Register
```javascript
POST /auth/register
{
  email: "user@email.com",
  password: "password",
  role: "customer|organizer|admin"
}
Response: { access_token, user: {...} }
```

#### Login
```javascript
POST /auth/login
{
  email: "user@email.com",
  password: "password"
}
Response: { access_token, user: {...} }
```

#### Get Profile
```javascript
GET /auth/me
Headers: Authorization: Bearer <token>
Response: { _id, email, role, created_at }
```

### Event API

#### Get All Events
```javascript
GET /events
Query: { skip?, limit?, search? }
Response: [{ _id, title, venue, date, total_seats, ticket_price, ... }]
```

#### Get Single Event
```javascript
GET /events/:id
Response: { _id, title, venue, date, total_seats, ticket_price, ... }
```

#### Create Event (Organizer)
```javascript
POST /events
Authorization: Bearer <token>
{
  title: "Concert",
  venue: "Arena",
  date: "2024-04-01T19:00:00",
  total_seats: 100,
  ticket_price: 500,
  description: "..."
}
Response: { _id, ... }
```

#### Update Event (Organizer)
```javascript
PUT /events/:id
Authorization: Bearer <token>
{ title, venue, date, total_seats, ticket_price, description }
Response: { _id, ... }
```

#### Delete Event (Organizer)
```javascript
DELETE /events/:id
Authorization: Bearer <token>
Response: { success: true }
```

### Seat API

#### Get Event Seats
```javascript
GET /events/:event_id/seats
Response: [{ _id, seat_number, status: "available|booked|locked" }]
```

#### Lock Seats (5 min timeout)
```javascript
POST /seats/lock
Authorization: Bearer <token>
{
  event_id: "...",
  seat_numbers: ["A1", "A2", "B1"]
}
Response: { locked_seats: [...] }
```

#### Release Seats
```javascript
POST /seats/release
Authorization: Bearer <token>
{
  event_id: "...",
  seat_numbers: ["A1", "A2"]
}
Response: { released: true }
```

### Booking API

#### Create Booking
```javascript
POST /bookings
Authorization: Bearer <token>
{
  event_id: "...",
  seat_numbers: ["A1", "A2"]
}
Response: { _id, user_id, event_id, seat_numbers, status: "pending" }
```

#### Get My Bookings
```javascript
GET /bookings/my
Authorization: Bearer <token>
Response: [{ _id, event_id, seat_numbers, status, created_at, ... }]
```

#### Get Single Booking
```javascript
GET /bookings/:id
Authorization: Bearer <token>
Response: { _id, ... }
```

#### Confirm Booking (After successful payment)
```javascript
PUT /bookings/:id/confirm
Authorization: Bearer <token>
Response: { _id, status: "confirmed" }
```

#### Cancel Booking
```javascript
DELETE /bookings/:id
Authorization: Bearer <token>
Response: { success: true }
```

### Payment API

#### Process Payment
```javascript
POST /payments
Authorization: Bearer <token>
{
  booking_id: "...",
  amount: 1000,
  payment_method: "card",
  card_details: {
    cardNumber: "4242...",
    cardHolder: "John Doe",
    expiryDate: "12/25",
    cvv: "123"
  }
}
Response: { _id, booking_id, amount, status: "success|failed" }
```

#### Get Payment Status
```javascript
GET /payments/:id
Authorization: Bearer <token>
Response: { _id, booking_id, amount, status, payment_time }
```

### Admin API

#### Get Reports
```javascript
GET /admin/reports
Authorization: Bearer <token> (admin only)
Response: [{ booking_id, event_title, user_email, amount, status, payment_time }]
```

#### Get All Users
```javascript
GET /admin/users
Authorization: Bearer <token> (admin only)
Response: [{ _id, email, role, created_at }]
```

#### Delete User
```javascript
DELETE /admin/users/:user_id
Authorization: Bearer <token> (admin only)
Response: { success: true }
```

---

## 🔐 Authentication Flow

### Request Flow
```
1. User submits form
   ↓
2. axiosInstance makes request
   ↓
3. Request interceptor adds JWT token
   ↓
4. Backend validates token
   ↓
5. Response received
   ↓
6. Response interceptor checks status
   ↓
7. If 401: Clear auth & redirect to login
   ↓
8. Component receives data
```

### JWT Token Management
```
localStorage:
  - auth_token: "eyJhbGc..."
  - user_data: { "_id": "...", "email": "...", "role": "..." }
```

---

## 🛠️ Usage Examples

### Fetching Data with useFetch Hook
```javascript
import { useFetch } from '../hooks/useFetch.js';
import { eventApi } from '../api/endpoints.js';

function MyComponent() {
  const { data: events, loading, error } = useFetch(
    () => eventApi.getEvents({}),
    []
  );
  
  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {events?.map(e => <EventCard key={e._id} event={e} />)}
    </div>
  );
}
```

### Using Auth Hook
```javascript
import { useAuth } from '../hooks/useAuth.js';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <div>Welcome, {user?.email}</div>;
}
```

### Making API Call Directly
```javascript
import { eventApi } from '../api/endpoints.js';

async function createEvent(eventData) {
  try {
    const response = await eventApi.createEvent(eventData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Error creating event';
    return { error: message };
  }
}
```

### Form Submission with API
```javascript
async function handleSubmit(e) {
  e.preventDefault();
  
  const result = await authApi.login({
    email,
    password
  });
  
  if (result.success) {
    navigate('/events');
  } else {
    setError(result.error);
  }
}
```

---

## 📊 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  email: "user@email.com",
  password: "hashed",
  role: "customer|organizer|admin",
  created_at: ISODate
}
```

### Event Model
```javascript
{
  _id: ObjectId,
  title: "Concert",
  venue: "Arena",
  date: ISODate,
  organizer_id: ObjectId,
  total_seats: 100,
  ticket_price: 500,
  description: "...",
  created_at: ISODate
}
```

### Booking Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  event_id: ObjectId,
  seat_numbers: ["A1", "A2"],
  status: "pending|confirmed|cancelled",
  total_price: 1000,
  created_at: ISODate
}
```

### Payment Model
```javascript
{
  _id: ObjectId,
  booking_id: ObjectId,
  amount: 1000,
  status: "success|failed",
  payment_time: ISODate
}
```

---

## ⚙️ Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_MONGODB_URI=mongodb+srv://...
```

### API Base Configuration
- **Timeout**: Default axios timeout
- **Headers**: Content-Type: application/json
- **Auth**: JWT Bearer token
- **CORS**: Enabled on backend

---

## 🚀 API Testing

### Using Browser DevTools
1. Open Network tab
2. Filter for API calls
3. Check request/response
4. Verify headers

### Using Postman
1. Import API endpoints
2. Set Authorization token
3. Test each endpoint
4. Check response data

### Using cURL
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password","role":"customer"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Get events (with token)
curl http://localhost:8000/events \
  -H "Authorization: Bearer <token>"
```

---

## ✅ Integration Checklist

- [x] All API endpoints mapped
- [x] JWT authentication implemented
- [x] Error handling in place
- [x] Loading states added
- [x] Form validation working
- [x] Data caching with Context
- [x] Protected routes setup
- [x] API interceptors configured
- [x] Token management functional
- [x] Role-based access control

---

## 📝 Notes

1. **Token Storage**: JWT stored in localStorage (production should use httpOnly cookies)
2. **CORS**: Must be enabled on backend
3. **API URLs**: Update VITE_API_BASE_URL if backend URL changes
4. **Error Handling**: All API errors are caught and displayed
5. **Rate Limiting**: Implement on backend if needed
6. **Session**: Token expires based on backend configuration

---

## 🔗 Related Documentation

- [Frontend README.md](./README.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Setup Guide](../SETUP_GUIDE.md)
- Backend API Documentation: `http://localhost:8000/docs`

---

**Last Updated**: March 2024
**Version**: 1.0.0
