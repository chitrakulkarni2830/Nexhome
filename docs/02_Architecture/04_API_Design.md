# API Design

| Service | Endpoint | Method |
|----------|----------|---------|
| Auth | /login | POST |
| Devices | /devices | GET |
| Devices | /devices | POST |
| Devices | /devices/{id} | DELETE |
| Devices | /devices/{id}/state | PUT |
| Telemetry | /telemetry | POST |
| Analytics | /analytics | GET |
| Routines | /routines | GET |
| Routines | /routines | POST |

---

# Authentication

JWT Bearer Token

---

# Data Format

JSON

---

# Response Codes

200 OK

201 Created

400 Bad Request

401 Unauthorized

404 Not Found

429 Too Many Requests

500 Internal Server Error