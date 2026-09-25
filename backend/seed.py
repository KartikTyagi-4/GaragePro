from datetime import datetime, timedelta
from decimal import Decimal
import random

from faker import Faker

from app.database import Base, SessionLocal, engine
from app.models import (
    Booking,
    BookingStatus,
    Customer,
    Mechanic,
    Service,
    Vehicle,
)

fake = Faker("en_IN")
random.seed(42)


SERVICES = [
    {"name": "Engine Oil Change", "category": "Maintenance", "price": 1500},
    {"name": "General Vehicle Service", "category": "Maintenance", "price": 3500},
    {"name": "Battery Replacement", "category": "Electrical", "price": 4500},
    {"name": "Flat Tyre Repair", "category": "Tyres", "price": 800},
    {"name": "Tyre Replacement", "category": "Tyres", "price": 6000},
    {"name": "Brake Repair", "category": "Repairs", "price": 2800},
    {"name": "Engine Diagnostics", "category": "Diagnostics", "price": 1800},
    {"name": "AC Repair", "category": "Electrical", "price": 3200},
    {"name": "Emergency Roadside Assistance", "category": "Emergency", "price": 1200},
    {"name": "Car Wash & Detailing", "category": "Cleaning", "price": 1000},
]


VEHICLES = [
    ("Maruti Suzuki", "Swift"),
    ("Hyundai", "Creta"),
    ("Tata", "Nexon"),
    ("Mahindra", "Scorpio"),
    ("Honda", "City"),
    ("Toyota", "Innova"),
    ("Kia", "Seltos"),
    ("Maruti Suzuki", "Baleno"),
    ("Hyundai", "i20"),
    ("Tata", "Punch"),
]


def seed_database():
    print("🗄️ Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Clear existing data for repeatable seeding
        print("🧹 Clearing existing data...")
        db.query(Booking).delete()
        db.query(Vehicle).delete()
        db.query(Customer).delete()
        db.query(Mechanic).delete()
        db.query(Service).delete()
        db.commit()

        # -------------------------
        # SERVICES
        # -------------------------
        print("🔧 Creating services...")

        services = []

        for service_data in SERVICES:
            service = Service(
                name=service_data["name"],
                category=service_data["category"],
                base_price=Decimal(str(service_data["price"])),
            )

            db.add(service)
            services.append(service)

        db.commit()

        for service in services:
            db.refresh(service)

        # -------------------------
        # MECHANICS
        # -------------------------
        print("👨‍🔧 Creating mechanics...")

        mechanics = []

        mechanic_statuses = [
            "AVAILABLE",
            "ON_JOB",
            "OFFLINE",
        ]

        for _ in range(25):
            mechanic = Mechanic(
                name=fake.name(),
                phone=fake.unique.msisdn()[:10],
                status=random.choices(
                    mechanic_statuses,
                    weights=[45, 40, 15],
                )[0],
                location=random.choice(
                    [
                        "Delhi",
                        "Noida",
                        "Gurgaon",
                        "Ghaziabad",
                        "Faridabad",
                    ]
                ),
                jobs_completed=random.randint(15, 250),
            )

            db.add(mechanic)
            mechanics.append(mechanic)

        db.commit()

        for mechanic in mechanics:
            db.refresh(mechanic)

        # -------------------------
        # CUSTOMERS + VEHICLES
        # -------------------------
        print("👥 Creating customers and vehicles...")

        customers = []
        vehicles = []

        for _ in range(75):
            customer = Customer(
                name=fake.name(),
                email=fake.unique.email(),
                phone=fake.unique.msisdn()[:10],
                created_at=fake.date_time_between(
                    start_date="-1y",
                    end_date="now",
                ),
            )

            db.add(customer)
            customers.append(customer)

        db.commit()

        for customer in customers:
            db.refresh(customer)

            # Each customer gets 1–2 vehicles
            for _ in range(random.randint(1, 2)):
                brand, model = random.choice(VEHICLES)

                vehicle = Vehicle(
                    customer_id=customer.id,
                    registration_number=(
                        f"{random.choice(['DL', 'UP', 'HR'])}"
                        f"{random.randint(10, 99)}"
                        f"{fake.bothify(text='??####').upper()}"
                    ),
                    brand=brand,
                    model=model,
                    year=random.randint(2015, 2025),
                    fuel_type=random.choice(
                        ["Petrol", "Diesel", "CNG", "Electric"],
                    ),
                )

                db.add(vehicle)
                vehicles.append(vehicle)

        db.commit()

        for vehicle in vehicles:
            db.refresh(vehicle)

        # -------------------------
        # BOOKINGS
        # -------------------------
        print("📋 Creating 600 realistic bookings...")

        status_choices = [
            BookingStatus.PENDING,
            BookingStatus.ASSIGNED,
            BookingStatus.ON_THE_WAY,
            BookingStatus.IN_PROGRESS,
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
        ]

        status_weights = [
            10,
            12,
            8,
            10,
            50,
            10,
        ]

        for i in range(1, 601):
            vehicle = random.choice(vehicles)

            # Customer linked to selected vehicle
            customer = next(
                customer
                for customer in customers
                if customer.id == vehicle.customer_id
            )

            service = random.choice(services)

            status = random.choices(
                status_choices,
                weights=status_weights,
            )[0]

            mechanic = None

            if status not in [
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
            ]:
                mechanic = random.choice(mechanics)

            scheduled_at = fake.date_time_between(
                start_date="-90d",
                end_date="+14d",
            )

            amount_multiplier = random.uniform(0.9, 1.6)

            booking = Booking(
                booking_number=f"IM-{10000 + i}",
                customer_id=customer.id,
                vehicle_id=vehicle.id,
                mechanic_id=mechanic.id if mechanic else None,
                service_id=service.id,
                status=status,
                amount=Decimal(
                    str(
                        round(
                            float(service.base_price)
                            * amount_multiplier,
                            2,
                        )
                    )
                ),
                scheduled_at=scheduled_at,
                created_at=scheduled_at - timedelta(
                    days=random.randint(0, 5)
                ),
            )

            db.add(booking)

            if i % 100 == 0:
                print(f"   Created {i} bookings...")

        db.commit()

        print("\n🎉 Database seeded successfully!")
        print("   ✓ 10 services")
        print("   ✓ 25 mechanics")
        print("   ✓ 75 customers")
        print(f"   ✓ {len(vehicles)} vehicles")
        print("   ✓ 600 bookings")

    except Exception as error:
        db.rollback()
        print(f"\n❌ Error while seeding: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()