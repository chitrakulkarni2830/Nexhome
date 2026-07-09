# System Architecture

| Field | Value |
|-------|-------|
| Project | NexHome |
| Version | 1.0 |
| Sprint | Sprint 0 |
| Status | Approved |

---

# Overview

NexHome follows a Microservices Architecture where independent services communicate using REST APIs.

The application consists of three primary layers:

- Frontend (Vanilla JavaScript)
- Node.js Ingestion Service
- FastAPI Core Service

SQLite acts as the persistent storage layer.

---

# High-Level Architecture

User

↓

Frontend (Vanilla JavaScript)

↓

Node.js Ingestion Service

↓

FastAPI Core Service

↓

SQLite Database

---

# Responsibilities

## Frontend

- Render dashboard
- Device controls
- Live polling
- Error handling

---

## Node.js Service

- Receive telemetry
- Validate payloads
- Rate limiting
- Forward requests

---

## FastAPI Service

- Authentication
- Device CRUD
- Business logic
- Analytics
- Heartbeat
- Database

---

## Database

- Devices
- Telemetry
- Routines