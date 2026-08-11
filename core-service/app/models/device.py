from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # e.g., 'light', 'thermostat', 'lock'
    is_on = Column(Boolean, default=False)
    state_value = Column(String, nullable=True) # e.g., '72F' for thermostat, could be JSON string
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", backref="devices")
