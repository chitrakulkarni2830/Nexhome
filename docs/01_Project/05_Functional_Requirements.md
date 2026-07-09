# Functional Requirements

| Field | Value |
|-------|-------|
| Project | NexHome |
| Version | 1.0 |
| Sprint | Sprint 0 |
| Status | Approved |

---

# Overview

This document defines the functional requirements of the NexHome Smart Home IoT platform.

---

# User Authentication

FR-001
The system shall authenticate users using JWT authentication.

FR-002
The system shall issue a valid JWT token after successful login.

FR-003
The system shall reject invalid credentials.

---

# Device Management

FR-004
The system shall allow users to register smart devices.

FR-005
The system shall allow users to delete registered devices.

FR-006
The system shall display all registered devices on the dashboard.

---

# Telemetry

FR-007
The Node.js ingestion service shall receive telemetry data.

FR-008
The ingestion service shall validate incoming payloads.

FR-009
The ingestion service shall forward sanitized data to the FastAPI service.

---

# Device State

FR-010
The system shall allow users to change device state (ON/OFF).

FR-011
The dashboard shall immediately reflect successful state changes.

---

# Live Dashboard

FR-012
The dashboard shall refresh telemetry every 5 seconds.

FR-013
The dashboard shall update without requiring a page refresh.

---

# Routines

FR-014
The system shall allow users to create routines (Scenes).

FR-015
The system shall execute routines affecting multiple devices.

---

# Analytics

FR-016
The system shall calculate active device count.

FR-017
The system shall calculate average temperature.

---

# Heartbeat

FR-018
The system shall detect offline devices after 5 minutes without telemetry.

---

# Error Handling

FR-019
The frontend shall display an error banner when backend communication fails.