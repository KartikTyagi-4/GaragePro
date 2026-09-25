from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Booking, Customer


router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"],
)


# =====================================================
# PYDANTIC SCHEMAS
# =====================================================

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


# =====================================================
# GET CUSTOMERS
# =====================================================

@router.get("")
def get_customers(
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Customer)

    # Search customers
    if search:
        search_filter = f"%{search}%"

        query = query.filter(
            or_(
                Customer.name.ilike(search_filter),
                Customer.email.ilike(search_filter),
                Customer.phone.ilike(search_filter),
            )
        )

    # Count total results before pagination
    total = query.count()

    # Fetch customers
    customers = (
        query
        .order_by(Customer.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    data = []

    for customer in customers:

        total_bookings = (
            db.query(Booking)
            .filter(
                Booking.customer_id == customer.id
            )
            .count()
        )

        data.append(
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "total_bookings": total_bookings,
                "created_at": customer.created_at.isoformat(),
            }
        )

    return {
        "data": data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
        },
    }


# =====================================================
# CREATE CUSTOMER
# =====================================================

@router.post("", status_code=201)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
):
    # Clean input data
    name = data.name.strip()
    email = data.email.lower().strip()
    phone = data.phone.strip()

    # Basic name validation
    if not name:
        raise HTTPException(
            status_code=400,
            detail="Customer name cannot be empty",
        )

    # Basic phone validation
    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Customer phone cannot be empty",
        )

    # Check if customer already exists
    existing_customer = (
        db.query(Customer)
        .filter(
            or_(
                Customer.email == email,
                Customer.phone == phone,
            )
        )
        .first()
    )

    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail=(
                "A customer with this email or "
                "phone number already exists"
            ),
        )

    # Create new customer
    customer = Customer(
        name=name,
        email=email,
        phone=phone,
    )

    try:
        db.add(customer)
        db.commit()
        db.refresh(customer)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Unable to create customer",
        )

    return {
        "message": "Customer created successfully",
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "total_bookings": 0,
            "created_at": customer.created_at.isoformat(),
        },
    }


# =====================================================
# GET SINGLE CUSTOMER
# =====================================================

@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    total_bookings = (
        db.query(Booking)
        .filter(
            Booking.customer_id == customer.id
        )
        .count()
    )

    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "total_bookings": total_bookings,
        "created_at": customer.created_at.isoformat(),
    }


# =====================================================
# UPDATE CUSTOMER
# =====================================================

@router.patch("/{customer_id}")
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
):
    # Find customer
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    # Customer does not exist
    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    # Get only the fields sent by the user
    update_data = data.model_dump(exclude_unset=True)

    # Check if any data was provided
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No customer data provided for update",
        )

    # =================================================
    # UPDATE NAME
    # =================================================

    if "name" in update_data:
        name = update_data["name"].strip()

        if not name:
            raise HTTPException(
                status_code=400,
                detail="Customer name cannot be empty",
            )

        customer.name = name

    # =================================================
    # UPDATE EMAIL
    # =================================================

    if "email" in update_data:
        email = update_data["email"].lower().strip()

        existing_customer = (
            db.query(Customer)
            .filter(
                Customer.email == email,
                Customer.id != customer_id,
            )
            .first()
        )

        if existing_customer:
            raise HTTPException(
                status_code=400,
                detail="Email is already used by another customer",
            )

        customer.email = email

    # =================================================
    # UPDATE PHONE
    # =================================================

    if "phone" in update_data:
        phone = update_data["phone"].strip()

        if not phone:
            raise HTTPException(
                status_code=400,
                detail="Customer phone cannot be empty",
            )

        existing_customer = (
            db.query(Customer)
            .filter(
                Customer.phone == phone,
                Customer.id != customer_id,
            )
            .first()
        )

        if existing_customer:
            raise HTTPException(
                status_code=400,
                detail="Phone number is already used by another customer",
            )

        customer.phone = phone

    # =================================================
    # SAVE CHANGES
    # =================================================

    try:
        db.commit()
        db.refresh(customer)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Unable to update customer",
        )

    # Count total bookings
    total_bookings = (
        db.query(Booking)
        .filter(
            Booking.customer_id == customer.id
        )
        .count()
    )

    return {
        "message": "Customer updated successfully",
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "total_bookings": total_bookings,
            "created_at": customer.created_at.isoformat(),
        },
    }