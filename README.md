\# 🚗 GaragePro — Live Vehicle Service Operations Dashboard



A full-stack live operations dashboard built for managing and monitoring vehicle service operations.



The application is designed for an operations team to track bookings, mechanics, customers, services, revenue, and operational performance in real time.



\---



\## 🌐 Live Demo



\- \*\*Frontend:\*\* \[Add Vercel URL here]

\- \*\*Backend API:\*\* \[Add AWS URL here]

\- \*\*GitHub Repository:\*\* Add your GitHub repository URL here

\- \*\*API Documentation:\*\* \[Add Backend URL]/docs



\---



\# 📸 Project Overview



GaragePro provides a centralized dashboard for a vehicle service company such as AutoCare Network.



Operations teams can use the platform to monitor:



\- Total bookings

\- Today's bookings

\- Completed bookings

\- Pending bookings

\- Cancelled bookings

\- Revenue

\- Active mechanics

\- Customers

\- Service categories

\- Booking analytics



The dashboard is built as a full-stack application where the frontend retrieves actual data from a backend API and database rather than relying entirely on static frontend JSON.



\---



\# ✨ Key Features



\## 📊 Dashboard Overview



\- Total bookings

\- Today's bookings

\- Completed bookings

\- Pending bookings

\- Cancelled bookings

\- Total revenue

\- Active mechanics

\- New customers



\## 📈 Analytics



\- Bookings over time

\- Revenue over time

\- Booking status distribution

\- Service category breakdown



\## 📋 Booking Management



\- Search bookings

\- Filter bookings

\- Sort booking data

\- Pagination

\- Booking status tracking

\- Customer information

\- Vehicle information

\- Assigned mechanic

\- Service details

\- Booking amount

\- Date and time



\## 🔧 Mechanic Management



\- Mechanic profiles

\- Current status

\- Completed jobs

\- Current or latest booking



\## 👥 Customer Management



\- Customer information

\- Booking history

\- Vehicle relationships



\## ⚡ Live Operations



The dashboard is designed to periodically refresh backend data, allowing operational information and booking status changes to be reflected without manually reloading the application.



\---



\# 🛠️ Tech Stack



\## Frontend



\- Next.js

\- React

\- TypeScript

\- Tailwind CSS

\- shadcn/ui

\- Recharts



\## Backend



\- Python

\- FastAPI

\- SQLAlchemy

\- Pydantic



\## Database



\- SQLite for development and seeded operational data



The backend architecture can be configured to support production databases such as PostgreSQL.



\## Infrastructure \& Deployment



\- Frontend: Vercel

\- Backend: AWS EC2

\- Source Control: GitHub

\- Containerization: Docker



\---



\# 🏗️ Architecture



```text

┌─────────────────────┐

│                     │

│   Next.js Frontend  │

│      (Vercel)       │

│                     │

└──────────┬──────────┘

&#x20;          │

&#x20;          │ REST API

&#x20;          ▼

┌─────────────────────┐

│                     │

│   FastAPI Backend   │

│      (AWS EC2)      │

│                     │

└──────────┬──────────┘

&#x20;          │

&#x20;          │ SQLAlchemy

&#x20;          ▼

┌─────────────────────┐

│                     │

│      Database       │

│                     │

└─────────────────────┘


📁 Project Structure

garagepro/

│

├── frontend/

│   ├── src/

│   │   ├── app/

│   │   ├── components/

│   │   ├── lib/

│   │   └── types/

│   │

│   └── package.json

│

├── backend/

│   ├── app/

│   │   ├── api/

│   │   ├── models/

│   │   ├── schemas/

│   │   ├── config.py

│   │   ├── database.py

│   │   └── main.py

│   │

│   ├── requirements.txt

│   ├── seed.py

│   └── Dockerfile

│

└── README.md



🔌 API Endpoints





Dashboard

GET /api/dashboard

Returns aggregated dashboard metrics and analytics data.



Bookings

GET /api/bookings



Returns booking records with filtering and pagination support.

GET /api/bookings/{id}

Returns detailed information for a specific booking.



Mechanics



GET /api/mechanics

Returns mechanic information including current status and completed jobs.

Customers



GET /api/customers

Returns customer information and related operational data.



Services

GET /api/services

Returns available vehicle service categories.



Vehicles

GET /api/vehicles

Returns vehicle information.



📚 API Documentation



FastAPI automatically generates interactive API documentation.

Once the backend is running:

http://localhost:8000/docs

The production API documentation will be available at:

https://YOUR-BACKEND-URL/docs



💻 Local Development Setup



Clone the Repository

git clone https://github.com/YOUR_GITHUB_USERNAME/garagepro.git

cd garagepro

Backend Setup



Navigate to the backend directory:

cd backend



Create a Python virtual environment:

python -m venv venv



Activate it on Windows:

venv\\Scripts\\activate



Install dependencies:

pip install -r requirements.txt



Configure environment variables:

copy .env.example .env



Seed the database:

python seed.py



Start the FastAPI server:



uvicorn app.main:app --reload



The backend should be available at:

http://localhost:8000



API documentation:



http://localhost:8000/docs



Frontend Setup



Navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Configure environment variables if required.

Example:

NEXT\_PUBLIC\_API\_URL=http://localhost:8000

Start the development server:

npm run dev

Open:

http://localhost:3000



🗄️ Data Model



The application contains relationships between:

\- Customers

\- Vehicles

\- Bookings

\- Mechanics

\- Services

A booking connects a customer, vehicle, service, and mechanic.



Example booking lifecycle:



Pending

&#x20;  ↓

Assigned

&#x20;  ↓

Mechanic On The Way

&#x20;  ↓

In Progress

&#x20;  ↓

Completed

Bookings can also be cancelled.



🌱 Seed Data

The backend includes a seed script that generates realistic operational data including:

\- Hundreds of bookings

\- Multiple customers

\- Multiple mechanics

\- Different vehicle types

\- Multiple service categories

\- Different booking statuses

\- Different dates and revenue amounts



This allows the dashboard analytics and operational tables to simulate a realistic vehicle service platform.



🐳 Docker



The backend includes Docker configuration for containerized deployment.



Example:

docker build -t garagepro-backend .



Run:

docker run -p 8000:8000 garagepro-backend



🚀 Deployment



Frontend



The frontend is deployed using Vercel.

Vercel is connected to the GitHub repository and automatically builds the Next.js application.

Backend

The FastAPI backend is deployed on AWS infrastructure.

The backend exposes REST APIs that are consumed by the deployed frontend.



🤖 AI Usage



AI tools were used as engineering productivity tools throughout the development process.

Tools used include:



\- ChatGPT

\- Cursor AI



AI assistance was used for:



\- Architecture planning

\- UI development

\- Backend API development

\- Database modelling

\- Debugging

\- Generating seed data

\- Improving code quality

\- Deployment troubleshooting

\- Documentation

All generated code was reviewed, integrated, tested, and modified as required to ensure understanding of the application's architecture and implementation.



🧠 Technical Decisions



Why Next.js?

Next.js provides a modern React-based frontend architecture, strong performance, and straightforward deployment through Vercel.



Why FastAPI?

FastAPI provides fast API development, automatic validation through Pydantic, and automatically generated OpenAPI documentation.



Why SQLAlchemy?

SQLAlchemy provides a structured ORM layer for managing database models and relationships.



Why a separate frontend and backend?

Separating the frontend from the backend creates a cleaner architecture and allows both services to be independently developed and deployed.



🎯 Future Improvements



Potential improvements include:

\- WebSocket-based real-time updates

\- Authentication and authorization

\- Role-based access control

\- PostgreSQL production database

\- Redis caching

\- Real-time notifications

\- Mechanic location tracking

\- Interactive map

\- CSV exports

\- Automated testing

\- GitHub Actions CI/CD

\- Advanced analytics



👨‍💻 Author



Original Project Author: Vaibhav Pandey

\- GitHub: https://github.com/YOUR_GITHUB_USERNAME

\- LinkedIn: https://www.linkedin.com/in/vaibhav-pandey-649817327/



🏆 What I Am Most Proud Of



The most rewarding aspect of this project is building it as a complete full-stack system rather than only designing a frontend interface.

The project connects a modern operations dashboard with a structured backend API, database models, realistic operational data, analytics, and cloud deployment architecture.

The goal was to create something that feels closer to an actual operations product that a vehicle service company could use every day.




