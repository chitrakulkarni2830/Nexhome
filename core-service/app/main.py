from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
import app.models.user
import app.models.device
from app.api import auth

Base.metadata.create_all(bind=engine)


app = FastAPI(title="NexHome Core Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "NexHome Core"}
