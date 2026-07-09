# Microservices Architecture

| Field | Value |
|-------|-------|
| Project | NexHome |
| Sprint | Sprint 0 |

---

# Service A

Node.js Express

Responsibilities

- Telemetry ingestion
- Payload validation
- Rate limiting
- Forward requests

---

# Service B

FastAPI

Responsibilities

- Authentication
- CRUD
- Device states
- Analytics
- Heartbeat
- Database access

---

# Communication

Protocol

REST API

Data Format

JSON

Communication

HTTP

Authentication

JWT

---

# Benefits

- Loose coupling
- Independent testing
- Independent deployment
- Easier scalability