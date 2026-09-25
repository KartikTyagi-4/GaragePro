from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Booking, BookingStatus, Mechanic


router = APIRouter(
    prefix="/api/mechanics",
    tags=["Mechanics"],
)


# =====================================================
# PYDANTIC SCHEMAS
# =====================================================

class MechanicCreate(BaseModel):
    name: str
    phone: str
    status: str = "AVAILABLE"


class MechanicUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class MechanicStatusUpdate(BaseModel):
    status: str


# =====================================================
# HELPER FUNCTION
# =====================================================

def get_mechanic_data(
    mechanic: Mechanic,
    db: Session,
):
    completed_jobs = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.mechanic_id == mechanic.id,
            Booking.status == BookingStatus.COMPLETED,
        )
        .scalar()
    )

    current_booking = (
        db.query(Booking)
        .filter(
            Booking.mechanic_id == mechanic.id,
            Booking.status.in_(
                [
                    BookingStatus.PENDING,
                    BookingStatus.IN_PROGRESS,
                ]
            ),
        )
        .order_by(
            Booking.scheduled_at.desc()
        )
        .first()
    )

    return {
        "id": mechanic.id,
        "name": mechanic.name,
        "phone": mechanic.phone,
        "status": mechanic.status,
        "jobs_completed": completed_jobs or 0,
        "current_booking": (
            current_booking.booking_number
            if current_booking
            else None
        ),
    }


# =====================================================
# GET ALL MECHANICS
# =====================================================

@router.get("")
def get_mechanics(
    db: Session = Depends(get_db),
):
    mechanics = (
        db.query(Mechanic)
        .order_by(Mechanic.id.desc())
        .all()
    )

    results = [
        get_mechanic_data(mechanic, db)
        for mechanic in mechanics
    ]

    return {
        "data": results,
        "total": len(results),
    }


# =====================================================
# CREATE MECHANIC
# =====================================================

@router.post("", status_code=201)
def create_mechanic(
    data: MechanicCreate,
    db: Session = Depends(get_db),
):
    name = data.name.strip()
    phone = data.phone.strip()
    status = data.status.strip().upper().replace(" ", "_")

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Mechanic name cannot be empty",
        )

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Mechanic phone cannot be empty",
        )

    if status not in ["AVAILABLE", "ON_JOB"]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Status must be AVAILABLE or ON_JOB"
            ),
        )

    existing_mechanic = (
        db.query(Mechanic)
        .filter(Mechanic.phone == phone)
        .first()
    )

    if existing_mechanic:
        raise HTTPException(
            status_code=400,
            detail=(
                "A mechanic with this phone number "
                "already exists"
            ),
        )

    mechanic = Mechanic(
        name=name,
        phone=phone,
        status=status,
    )

    try:
        db.add(mechanic)
        db.commit()
        db.refresh(mechanic)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Unable to create mechanic",
        )

    return {
        "message": "Mechanic created successfully",
        "mechanic": get_mechanic_data(
            mechanic,
            db,
        ),
    }


# =====================================================
# GET SINGLE MECHANIC
# =====================================================

@router.get("/{mechanic_id}")
def get_mechanic(
    mechanic_id: int,
    db: Session = Depends(get_db),
):
    mechanic = (
        db.query(Mechanic)
        .filter(Mechanic.id == mechanic_id)
        .first()
    )

    if not mechanic:
        raise HTTPException(
            status_code=404,
            detail="Mechanic not found",
        )

    return get_mechanic_data(
        mechanic,
        db,
    )


# =====================================================
# UPDATE MECHANIC
# =====================================================

@router.patch("/{mechanic_id}")
def update_mechanic(
    mechanic_id: int,
    data: MechanicUpdate,
    db: Session = Depends(get_db),
):
    mechanic = (
        db.query(Mechanic)
        .filter(Mechanic.id == mechanic_id)
        .first()
    )

    if not mechanic:
        raise HTTPException(
            status_code=404,
            detail="Mechanic not found",
        )

    if data.name is not None:
        name = data.name.strip()

        if not name:
            raise HTTPException(
                status_code=400,
                detail="Mechanic name cannot be empty",
            )

        mechanic.name = name

    if data.phone is not None:
        phone = data.phone.strip()

        if not phone:
            raise HTTPException(
                status_code=400,
                detail="Mechanic phone cannot be empty",
            )

        existing_mechanic = (
            db.query(Mechanic)
            .filter(
                Mechanic.phone == phone,
                Mechanic.id != mechanic_id,
            )
            .first()
        )

        if existing_mechanic:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Another mechanic already uses "
                    "this phone number"
                ),
            )

        mechanic.phone = phone

    if data.status is not None:
        status = data.status.strip().upper().replace(" ", "_")

        if status not in ["AVAILABLE", "ON_JOB"]:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Status must be AVAILABLE or ON_JOB"
                ),
            )

        mechanic.status = status

    try:
        db.commit()
        db.refresh(mechanic)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Unable to update mechanic",
        )

    return {
        "message": "Mechanic updated successfully",
        "mechanic": get_mechanic_data(
            mechanic,
            db,
        ),
    }


# =====================================================
# UPDATE MECHANIC STATUS
# =====================================================

@router.patch("/{mechanic_id}/status")
def update_mechanic_status(
    mechanic_id: int,
    data: MechanicStatusUpdate,
    db: Session = Depends(get_db),
):
    mechanic = (
        db.query(Mechanic)
        .filter(Mechanic.id == mechanic_id)
        .first()
    )

    if not mechanic:
        raise HTTPException(
            status_code=404,
            detail="Mechanic not found",
        )

    status = data.status.strip().upper().replace(" ", "_")

    if status not in ["AVAILABLE", "ON_JOB"]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Status must be AVAILABLE or ON_JOB"
            ),
        )

    mechanic.status = status

    db.commit()
    db.refresh(mechanic)

    return {
        "message": "Mechanic status updated successfully",
        "mechanic": get_mechanic_data(
            mechanic,
            db,
        ),
    }


# =====================================================
# DELETE MECHANIC
# =====================================================

@router.delete("/{mechanic_id}")
def delete_mechanic(
    mechanic_id: int,
    db: Session = Depends(get_db),
):
    mechanic = (
        db.query(Mechanic)
        .filter(Mechanic.id == mechanic_id)
        .first()
    )

    if not mechanic:
        raise HTTPException(
            status_code=404,
            detail="Mechanic not found",
        )

    active_booking = (
        db.query(Booking)
        .filter(
            Booking.mechanic_id == mechanic.id,
            Booking.status.in_(
                [
                    BookingStatus.PENDING,
                    BookingStatus.IN_PROGRESS,
                ]
            ),
        )
        .first()
    )

    if active_booking:
        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot delete a mechanic with an "
                "active booking"
            ),
        )

    try:
        db.delete(mechanic)
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to delete mechanic because "
                "existing records depend on it"
            ),
        )

    return {
        "message": "Mechanic deleted successfully",
        "mechanic_id": mechanic_id,
    }