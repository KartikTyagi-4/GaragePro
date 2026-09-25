from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import bookings
from app.api import customers
from app.api import dashboard
from app.api import mechanics
from app.api import services
from app.api import vehicles


app = FastAPI(
    title="GaragePro API",
    version="1.0.0",
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# ROUTERS
# =====================================================

app.include_router(bookings.router)

app.include_router(customers.router)

app.include_router(mechanics.router)

app.include_router(dashboard.router)

app.include_router(vehicles.router)

app.include_router(services.router)


# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():
    return {
        "message": "GaragePro API is running"
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }