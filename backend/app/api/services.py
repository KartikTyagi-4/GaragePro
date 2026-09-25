from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Service


router = APIRouter(
    prefix="/api/services",
    tags=["Services"],
)


@router.get("")
def get_services(
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