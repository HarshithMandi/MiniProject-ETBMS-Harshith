from fastapi import APIRouter

from app.api.routes import admin, auth, bookings, events, payments, seats, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(events.router)
api_router.include_router(seats.router)
api_router.include_router(bookings.router)
api_router.include_router(payments.router)
api_router.include_router(admin.router)
