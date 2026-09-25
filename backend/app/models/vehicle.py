from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    registration_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)

    year: Mapped[int] = mapped_column(Integer, nullable=False)

    fuel_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    customer = relationship(
        "Customer",
        back_populates="vehicles",
    )

    bookings = relationship(
        "Booking",
        back_populates="vehicle",
    )