from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    Booking,
    BookingStatus,
    Customer,
    Mechanic,
    Service,
    Vehicle,
)


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)


# =====================================================
# SCHEMAS
# =====================================================

class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    service_id: int

    mechanic_id: Optional[int] = None

    amount: Decimal

    scheduled_at: datetime

    status: BookingStatus = BookingStatus.PENDING


# =====================================================
# HELPERS
# =====================================================

def generate_booking_number() -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    unique_part = uuid4().hex[:4].upper()

    return f"GP-{timestamp}-{unique_part}"


# =====================================================
# BOOKING LOOKUP DATA
# Used by Add Booking form
# =====================================================

@router.get("/lookup/customers")
def get_booking_customers(
    db: Session = Depends(get_db),
):
    customers = (
        db.query(Customer)
        .order_by(Customer.name.asc())
        .all()
    )

    return {
        "data": [
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
            }
            for customer in customers
        ]
    }


@router.get("/lookup/vehicles")
def get_booking_vehicles(
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(Vehicle)
        .order_by(Vehicle.brand.asc())
    )

    if customer_id is not None:
        query = query.filter(
            Vehicle.customer_id == customer_id
        )

    vehicles = query.all()

    return {
        "data": [
            {
                "id": vehicle.id,
                "customer_id": vehicle.customer_id,
                "brand": vehicle.brand,
                "model": vehicle.model,
                "year": vehicle.year,
                "fuel_type": vehicle.fuel_type,
                "registration_number": (
                    vehicle.registration_number
                ),
            }
            for vehicle in vehicles
        ]
    }


@router.get("/lookup/services")
def get_booking_services(
    db: Session = Depends(get_db),
):
    services = (
        db.query(Service)
        .order_by(Service.name.asc())
        .all()
    )

    return {
        "data": [
            {
                "id": service.id,
                "name": service.name,
                "category": service.category,
                "base_price": float(
                    service.base_price
                ),
            }
            for service in services
        ]
    }


@router.get("/lookup/mechanics")
def get_booking_mechanics(
    db: Session = Depends(get_db),
):
    mechanics = (
        db.query(Mechanic)
        .order_by(Mechanic.name.asc())
        .all()
    )

    return {
        "data": [
            {
                "id": mechanic.id,
                "name": mechanic.name,
                "phone": mechanic.phone,
                "status": mechanic.status.value,
            }
            for mechanic in mechanics
        ]
    }


# =====================================================
# CREATE BOOKING
# =====================================================

@router.post("")
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == data.customer_id
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    vehicle = (
        db.query(Vehicle)
        .filter(
            Vehicle.id == data.vehicle_id
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found",
        )

    if vehicle.customer_id != data.customer_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected vehicle does not belong "
                "to the selected customer"
            ),
        )

    service = (
        db.query(Service)
        .filter(
            Service.id == data.service_id
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    if data.mechanic_id is not None:
        mechanic = (
            db.query(Mechanic)
            .filter(
                Mechanic.id == data.mechanic_id
            )
            .first()
        )

        if not mechanic:
            raise HTTPException(
                status_code=404,
                detail="Mechanic not found",
            )

    booking = Booking(
        booking_number=generate_booking_number(),
        customer_id=data.customer_id,
        vehicle_id=data.vehicle_id,
        service_id=data.service_id,
        mechanic_id=data.mechanic_id,
        amount=data.amount,
        scheduled_at=data.scheduled_at,
        status=data.status,
    )

    db.add(booking)

    db.commit()

    db.refresh(booking)

    return {
        "message": "Booking created successfully",
        "id": booking.id,
        "booking_number": booking.booking_number,
        "status": booking.status.value,
    }


# =====================================================
# GET BOOKINGS
# =====================================================

@router.get("")
def get_bookings(
    search: Optional[str] = None,
    status: Optional[BookingStatus] = None,
    mechanic_id: Optional[int] = None,
    service_id: Optional[int] = None,
    page: int = Query(
        default=1,
        ge=1,
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    sort_by: str = Query(
        default="scheduled_at"
    ),
    sort_order: str = Query(
        default="desc"
    ),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Booking)
        .options(
            joinedload(Booking.customer),
            joinedload(Booking.vehicle),
            joinedload(Booking.mechanic),
            joinedload(Booking.service),
        )
    )

    if search:
        search_filter = f"%{search}%"

        query = query.filter(
            or_(
                Booking.booking_number.ilike(
                    search_filter
                ),
                Booking.customer.has(
                    Customer.name.ilike(
                        search_filter
                    )
                ),
            )
        )

    if status:
        query = query.filter(
            Booking.status == status
        )

    if mechanic_id:
        query = query.filter(
            Booking.mechanic_id == mechanic_id
        )

    if service_id:
        query = query.filter(
            Booking.service_id == service_id
        )

    total = query.count()

    allowed_sort_fields = {
        "id": Booking.id,
        "booking_number": Booking.booking_number,
        "amount": Booking.amount,
        "scheduled_at": Booking.scheduled_at,
        "created_at": Booking.created_at,
        "status": Booking.status,
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        Booking.scheduled_at,
    )

    if sort_order.lower() == "asc":
        query = query.order_by(
            sort_column.asc()
        )
    else:
        query = query.order_by(
            sort_column.desc()
        )

    bookings = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "data": [
            {
                "id": booking.id,
                "booking_number": (
                    booking.booking_number
                ),
                "customer": {
                    "id": booking.customer.id,
                    "name": booking.customer.name,
                },
                "vehicle": {
                    "id": booking.vehicle.id,
                    "brand": booking.vehicle.brand,
                    "model": booking.vehicle.model,
                    "registration_number": (
                        booking.vehicle.registration_number
                    ),
                },
                "service": {
                    "id": booking.service.id,
                    "name": booking.service.name,
                    "category": (
                        booking.service.category
                    ),
                },
                "mechanic": (
                    {
                        "id": booking.mechanic.id,
                        "name": booking.mechanic.name,
                    }
                    if booking.mechanic
                    else None
                ),
                "status": (
                    booking.status.value
                ),
                "amount": float(
                    booking.amount
                ),
                "scheduled_at": (
                    booking.scheduled_at.isoformat()
                ),
            }
            for booking in bookings
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (
                (total + limit - 1) // limit
            ),
        },
    }


# =====================================================
# GET SINGLE BOOKING
# =====================================================

@router.get("/{booking_id}")
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.customer),
            joinedload(Booking.vehicle),
            joinedload(Booking.mechanic),
            joinedload(Booking.service),
        )
        .filter(
            Booking.id == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return {
        "id": booking.id,
        "booking_number": (
            booking.booking_number
        ),
        "customer": {
            "id": booking.customer.id,
            "name": booking.customer.name,
            "email": booking.customer.email,
            "phone": booking.customer.phone,
        },
        "vehicle": {
            "id": booking.vehicle.id,
            "brand": booking.vehicle.brand,
            "model": booking.vehicle.model,
            "year": booking.vehicle.year,
            "fuel_type": booking.vehicle.fuel_type,
            "registration_number": (
                booking.vehicle.registration_number
            ),
        },
        "service": {
            "id": booking.service.id,
            "name": booking.service.name,
            "category": (
                booking.service.category
            ),
        },
        "mechanic": (
            {
                "id": booking.mechanic.id,
                "name": booking.mechanic.name,
                "phone": booking.mechanic.phone,
            }
            if booking.mechanic
            else None
        ),
        "status": booking.status.value,
        "amount": float(booking.amount),
        "scheduled_at": (
            booking.scheduled_at.isoformat()
        ),
        "created_at": (
            booking.created_at.isoformat()
        ),
    }


# =====================================================
# UPDATE BOOKING STATUS
# =====================================================

@router.patch("/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    booking.status = data.status

    db.commit()

    db.refresh(booking)

    return {
        "message": (
            "Booking status updated successfully"
        ),
        "booking_id": booking.id,
        "status": booking.status.value,
    }