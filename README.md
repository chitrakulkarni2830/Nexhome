# NexHome

NexHome is a full-stack IoT device management platform built with React, FastAPI, Node.js, PostgreSQL, and real-time Server-Sent Events. It provides a reliable, responsive, and secure interface for monitoring and controlling connected smart devices.

## Features

- **JWT Authentication**: Secure user registration and login.
- **Device Management**: Add, remove, and toggle connected devices.
- **Device State Monitoring**: Instantly view the status of smart lights, thermostats, locks, and plugs.
- **Real-Time Telemetry Streaming**: Monitor dynamic device metrics over a continuous connection.
- **SSE-based Live Updates**: Push architecture for instant UI synchronization.
- **PostgreSQL Persistence**: Robust relational data storage for users and devices.
- **REST APIs**: Fast, typed endpoints built with Python and FastAPI.
- **Responsive Dashboard**: Polished, modern UI built with Vite and Tailwind CSS.

## Live Demo

**Frontend Dashboard**:  
https://nexhome-ten.vercel.app

**Core API Endpoint**:  
https://nexhome-lxfq.onrender.com

**Ingestion Service Endpoint**:  
https://nexhome-ingetion.onrender.com

**Core API Documentation (Swagger)**:  
https://nexhome-lxfq.onrender.com/docs

**Health Endpoints**:  
- Core Health: https://nexhome-lxfq.onrender.com/health
- Ingestion Health: https://nexhome-ingetion.onrender.com/health

## Tech Stack

- **React** & **Vite** (Frontend)
- **Tailwind CSS** (Styling)
- **FastAPI** & **Python** (Core Backend)
- **SQLAlchemy** & **PostgreSQL** (ORM and Database)
- **Supabase** (Database Hosting)
- **Node.js** & **Express** (Telemetry Ingestion)
- **JWT** (Security)
- **Server-Sent Events** (Real-time data stream)
- **Render** (Backend Hosting)
- **Vercel** (Frontend Hosting)

## Architecture & Deployment

The application is deployed across three scalable environments:

```text
Vercel
   ↓
React Frontend
   ↓
Render Core Service
   ↓
Supabase PostgreSQL

Vercel
   ↓
EventSource / SSE
   ↓
Render Ingestion Service
```

- **Frontend** (Vercel) serves the React SPA.
- **Core Service** (Render) handles authentication and CRUD operations, connecting directly to **Supabase PostgreSQL**.
- **Ingestion Service** (Render) handles high-throughput telemetry streams using Node.js and broadcasts real-time events to the frontend via SSE.

## Local Development

To run the platform locally, follow these steps:

### 1. Core Service
```bash
cd core-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Ingestion Service
```bash
cd ingestion-service
npm install
npm start
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

For local development, create `.env` files in the respective directories. **Do not commit secrets.**

### Frontend (`frontend/.env`)
```text
VITE_CORE_SERVICE_URL=http://localhost:8000
VITE_INGESTION_SERVICE_URL=http://localhost:3001
```

### Core Service (`core-service/.env`)
```text
DATABASE_URL=postgresql+psycopg://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=your_secure_random_string
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Ingestion Service (`ingestion-service/.env`)
```text
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Project Structure

```text
NexHome/
├── frontend/               # React Vite SPA
├── core-service/           # FastAPI backend
├── ingestion-service/      # Node.js SSE server
├── render.yaml             # Render deployment configuration
└── README.md
```
