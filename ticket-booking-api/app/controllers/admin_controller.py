from app.repositories.booking_repository import BookingRepository
from app.repositories.event_repository import EventRepository
from app.repositories.payment_repository import PaymentRepository
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService
from app.utils.helpers import serialize_mongo

user_service = UserService()
payment_repository = PaymentRepository()


def _get_reports_summary(payments: list[dict]) -> dict:
    revenue = sum(payment.get("amount", 0) for payment in payments if payment.get("status") == "success")
    return {
        "total_payments": len(payments),
        "successful_payments": sum(1 for payment in payments if payment.get("status") == "success"),
        "failed_payments": sum(1 for payment in payments if payment.get("status") == "failed"),
        "total_revenue": revenue,
    }


def get_reports() -> list[dict]:
    """Return payment report rows for the admin dashboard.

    Frontend expects an array of rows with keys:
    booking_id, event_title, user_email, amount, status, payment_time
    (plus _id for stable table row keys).
    """

    payments = [serialize_mongo(payment) for payment in payment_repository.list_all()]
    parsed_payments = [p for p in payments if p is not None]

    booking_repo = BookingRepository()
    event_repo = EventRepository()
    user_repo = UserRepository()

    booking_cache: dict[str, dict] = {}
    event_cache: dict[str, dict] = {}
    user_cache: dict[str, dict] = {}

    reports: list[dict] = []

    for payment in parsed_payments:
        booking_id = payment.get("booking_id")

        booking: dict | None = None
        if isinstance(booking_id, str) and booking_id:
            booking = booking_cache.get(booking_id)
            if booking is None:
                booking_doc = booking_repo.get_by_id(booking_id)
                booking = serialize_mongo(booking_doc) if booking_doc else None
                if booking is not None:
                    booking_cache[booking_id] = booking

        event_title: str | None = None
        user_email: str | None = None

        if booking:
            event_id = booking.get("event_id")
            if isinstance(event_id, str) and event_id:
                event = event_cache.get(event_id)
                if event is None:
                    event_doc = event_repo.get_by_id(event_id)
                    event = serialize_mongo(event_doc) if event_doc else None
                    if event is not None:
                        event_cache[event_id] = event
                if event:
                    event_title = event.get("title")

            user_id = booking.get("user_id")
            if isinstance(user_id, str) and user_id:
                user = user_cache.get(user_id)
                if user is None:
                    user_doc = user_repo.get_by_id(user_id)
                    user = serialize_mongo(user_doc) if user_doc else None
                    if user is not None:
                        user.pop("password", None)
                        user_cache[user_id] = user
                if user:
                    user_email = user.get("email")

        reports.append(
            {
                "_id": payment.get("_id"),
                "booking_id": booking_id,
                "event_title": event_title,
                "user_email": user_email,
                "amount": payment.get("amount"),
                "status": payment.get("status"),
                "payment_time": payment.get("payment_time"),
            }
        )

    return reports


def list_users() -> list[dict]:
    return user_service.list_users()


def list_payments() -> list[dict]:
    return [serialize_mongo(payment) for payment in payment_repository.list_all()]
