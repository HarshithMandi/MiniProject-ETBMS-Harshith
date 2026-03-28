from typing import Literal, TypedDict


class PaymentModel(TypedDict):
    booking_id: str
    amount: float
    status: Literal["success", "failed"]
    payment_time: str
