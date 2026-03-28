from app.repositories.payment_repository import PaymentRepository
from app.services.user_service import UserService
from app.utils.helpers import serialize_mongo

user_service = UserService()
payment_repository = PaymentRepository()


def get_reports() -> dict:
    payments = payment_repository.list_all()
    revenue = sum(payment.get("amount", 0) for payment in payments if payment.get("status") == "success")
    return {
        "total_payments": len(payments),
        "successful_payments": sum(1 for payment in payments if payment.get("status") == "success"),
        "failed_payments": sum(1 for payment in payments if payment.get("status") == "failed"),
        "total_revenue": revenue,
    }


def list_users() -> list[dict]:
    return user_service.list_users()


def list_payments() -> list[dict]:
    return [serialize_mongo(payment) for payment in payment_repository.list_all()]
