# Database Design

| Field | Value |
|-------|-------|
| Project | NexHome |

---

# Database

SQLite

---

# Tables

## Users

- id
- username
- password_hash

---

## Devices

- id
- device_name
- device_type
- status
- location
- created_at

---

## Telemetry

- id
- device_id
- temperature
- humidity
- timestamp

---

## Routines

- id
- routine_name

---

## Routine_Device

- routine_id
- device_id