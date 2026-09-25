from datetime import datetime, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Booking,
    BookingStatus,
    Customer,
    Mechanic,
    Service,
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    today = datetime.now().date()
    tomorrow = today + timedelta(days=1)

    # -------------------------
    # OVERVIEW STATISTICS
    # -------------------------

    total_bookings = (
        db.query(func.count(Booking.id))
        .scalar()
    )

    today_bookings = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.scheduled_at >= datetime.combine(
                today,
                time.min,
            ),
            Booking.scheduled_at < datetime.combine(
                tomorrow,
                time.min,
            ),
        )
        .scalar()
    )

    completed_bookings = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.status == BookingStatus.COMPLETED
        )
        .scalar()
    )

    pending_bookings = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.status == BookingStatus.PENDING
        )
        .scalar()
    )

    cancelled_bookings = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.status == BookingStatus.CANCELLED
        )
        .scalar()
    )

    total_revenue = (
        db.query(
            func.coalesce(
                func.sum(Booking.amount),
                0,
            )
        )
        .filter(
            Booking.status == BookingStatus.COMPLETED
        )
        .scalar()
    )

    active_mechanics = (
        db.query(func.count(Mechanic.id))
        .filter(
            Mechanic.status.in_(
                ["AVAILABLE", "ON_JOB"]
            )
        )
        .scalar()
    )

    new_customers = (
        db.query(func.count(Customer.id))
        .filter(
            Customer.created_at >= datetime.combine(
                today,
                time.min,
            ),
            Customer.created_at < datetime.combine(
                tomorrow,
                time.min,
            ),
        )
        .scalar()
    )

    # -------------------------
    # BOOKINGS TREND
    # LAST 14 DAYS
    # -------------------------

    start_date = today - timedelta(days=13)

    bookings_over_time_query = (
        db.query(
            func.date(
                Booking.scheduled_at
            ).label("date"),

            func.count(
                Booking.id
            ).label("count"),
        )
        .filter(
            Booking.scheduled_at >= start_date
        )
        .group_by(
            func.date(
                Booking.scheduled_at
            )
        )
        .order_by(
            func.date(
                Booking.scheduled_at
            )
        )
        .all()
    )

    bookings_over_time = [
        {
            "date": str(row.date),
            "bookings": row.count,
        }
        for row in bookings_over_time_query
    ]

    # -------------------------
    # REVENUE TREND
    # LAST 14 DAYS
    # -------------------------

    revenue_over_time_query = (
        db.query(
            func.date(
                Booking.scheduled_at
            ).label("date"),

            func.coalesce(
                func.sum(Booking.amount),
                0,
            ).label("revenue"),
        )
        .filter(
            Booking.scheduled_at >= start_date,
            Booking.status == BookingStatus.COMPLETED,
        )
        .group_by(
            func.date(
                Booking.scheduled_at
            )
        )
        .order_by(
            func.date(
                Booking.scheduled_at
            )
        )
        .all()
    )

    revenue_over_time = [
        {
            "date": str(row.date),
            "revenue": float(row.revenue),
        }
        for row in revenue_over_time_query
    ]

    # -------------------------
    # BOOKING STATUS BREAKDOWN
    # -------------------------

    status_query = (
        db.query(
            Booking.status,

            func.count(
                Booking.id
            ).label("count"),
        )
        .group_by(
            Booking.status
        )
        .all()
    )

    status_breakdown = [
        {
            "status": (
                row.status.value
                if hasattr(row.status, "value")
                else str(row.status)
            ),
            "count": row.count,
        }
        for row in status_query
    ]

    # -------------------------
    # SERVICE CATEGORY BREAKDOWN
    # -------------------------

    category_query = (
        db.query(
            Service.category,

            func.count(
                Booking.id
            ).label("count"),
        )
        .join(
            Booking,
            Booking.service_id == Service.id,
        )
        .group_by(
            Service.category
        )
        .order_by(
            func.count(
                Booking.id
            ).desc()
        )
        .all()
    )

    service_breakdown = [
        {
            "category": row.category,
            "count": row.count,
        }
        for row in category_query
    ]

    # -------------------------
    # FINAL RESPONSE
    # -------------------------

    return {
        "overview": {
            "total_bookings": total_bookings,
            "today_bookings": today_bookings,
            "completed_bookings": completed_bookings,
            "pending_bookings": pending_bookings,
            "cancelled_bookings": cancelled_bookings,
            "total_revenue": float(total_revenue),
            "active_mechanics": active_mechanics,
            "new_customers": new_customers,
        },

        "bookings_over_time": bookings_over_time,

        "revenue_over_time": revenue_over_time,

        "status_breakdown": status_breakdown,

        "service_breakdown": service_breakdown,
    }