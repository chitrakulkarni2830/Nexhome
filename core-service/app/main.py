import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
import app.models.user
import app.models.device
from app.api import auth, devices

Base.metadata.create_all(bind=engine)


app = FastAPI(title="NexHome Core Service")

# Configure CORS
cors_origins_str = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(devices.router, prefix="/api")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "NexHome Core"}
