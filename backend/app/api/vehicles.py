from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, Vehicle


router = APIRouter(
    prefix="/api/vehicles",
    tags=["Vehicles"],
)


class VehicleCreate(BaseModel):
    customer_id: int
    registration_number: str = Field(min_length=2, max_length=50)
    brand: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=1950, le=2100)
    fuel_type: str = Field(min_length=1, max_length=50)


def serialize_vehicle(vehicle: Vehicle):
    return {
        "id": vehicle.id,
        "customer_id": vehicle.customer_id,
        "brand": vehicle.brand,
        "model": vehicle.model,
        "year": vehicle.year,
        "fuel_type": vehicle.fuel_type,
        "registration_number": vehicle.registration_number,
    }


@router.get("")
def get_vehicles(
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Vehicle)
    if customer_id:
        query = query.filter(Vehicle.customer_id == customer_id)

    vehicles = query.order_by(Vehicle.id.desc()).all()
    return {"data": [serialize_vehicle(vehicle) for vehicle in vehicles]}


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return serialize_vehicle(vehicle)


@router.post("", status_code=201)
def create_vehicle(data: VehicleCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    registration = data.registration_number.strip().upper()
    existing = db.query(Vehicle).filter(Vehicle.registration_number == registration).first()
    if existing:
        raise HTTPException(status_code=400, detail="A vehicle with this registration number already exists")

    vehicle = Vehicle(
        customer_id=data.customer_id,
        registration_number=registration,
        brand=data.brand.strip(),
        model=data.model.strip(),
        year=data.year,
        fuel_type=data.fuel_type.strip(),
    )

    try:
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Unable to create vehicle")

    return {
        "message": "Vehicle created successfully",
        "vehicle": serialize_vehicle(vehicle),
    }
