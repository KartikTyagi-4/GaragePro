from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    service_id: int

    mechanic_id: Optional[int] = None

    amount: Decimal = Field(gt=0)

    scheduled_at: datetime

    status: BookingStatus = BookingStatus.PENDING