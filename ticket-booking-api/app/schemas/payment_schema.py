from pydantic import BaseModel, Field


class PaymentCreateRequest(BaseModel):
    booking_id: str
    amount: float = Field(gt=0)


class PaymentResponse(BaseModel):
    id: str
    booking_id: str
    amount: float
    status: str
    payment_time: str
