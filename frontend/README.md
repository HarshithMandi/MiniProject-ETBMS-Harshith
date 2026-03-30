# Event Ticket Booking Frontend

A React-based frontend for the Event Ticket Booking & Management System.

## Features

- 🎫 **Event Browsing**: Browse and search for events
- 🎯 **Seat Selection**: Interactive seat selection with real-time updates
- 💳 **Payment Processing**: Secure payment processing
- 📋 **Booking Management**: View and manage your bookings
- 🎭 **Organizer Dashboard**: Create and manage events
- 🔐 **Admin Dashboard**: System analytics and management

## Tech Stack

- **React 18** - UI Framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Create a `.env` file in the project root:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_MONGODB_URI=mongodb+srv://harshithmandi:super-secret-password@cluster0.qyrt8d7.mongodb.net/
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building

Build for production:
```bash
npm run build
```

The output will be in the `dist/` directory.

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API endpoints
│   ├── components/     # Reusable components
│   ├── context/        # React context (Auth, Booking)
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## Key Components

### Authentication
- **Login**: User login page
- **Register**: User registration with role selection
- **AuthContext**: Global auth state management

### Events
- **Events**: Event list with search
- **EventDetails**: Single event details
- **EventCard**: Reusable event card component

### Booking
- **SeatSelection**: Interactive seat grid
- **Payment**: Payment processing
- **MyBookings**: User's booking history
- **BookingCard**: Booking display component

### Dashboards
- **OrganizerDashboard**: Event creation and management
- **AdminDashboard**: System analytics and user management

## API Integration

All API calls are made through `axios` with:
- JWT token authentication (request interceptor)
- Automatic token refresh (response interceptor)
- Centralized error handling

## Available Routes

### Public
- `/` - Browse events
- `/login` - Login page
- `/register` - Registration page
- `/events/:id` - Event details

### Customer (Protected)
- `/events/:id/seats` - Seat selection
- `/events/:id/payment` - Payment processing
- `/my-bookings` - My bookings

### Organizer (Protected)
- `/organizer` - Event management dashboard

### Admin (Protected)
- `/admin` - System dashboard

## Demo Credentials

For testing, use these credentials:
- **Customer**: `user@email.com` / `password`
- **Organizer**: `organizer@email.com` / `password`
- **Admin**: `admin@email.com` / `password`

## Customization

### Styling
Modify `tailwind.config.js` to customize colors and theme.

### API Endpoints
Update API endpoints in `src/api/endpoints.js` if backend URL or structure changes.

### Authentication
Customize auth flow in `src/context/AuthContext.jsx`

## Troubleshooting

### API connection issues
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Verify `.env` configuration

### Authentication issues
- Clear browser local storage: `localStorage.clear()`
- Ensure token is valid
- Check JWT expiration in browser console

### Styling issues
- Make sure Tailwind CSS is compiled
- Clear browser cache
- Rebuild project: `npm run build`

## Performance Tips

- Use code splitting for large components
- Implement lazy loading for images
- Optimize bundle size
- Use React DevTools for profiling

## Support

For issues or questions, please refer to the backend API documentation or contact the development team.

## License

MIT License
