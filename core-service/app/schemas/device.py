from pydantic import BaseModel
from typing import Optional

class DeviceBase(BaseModel):
    name: str
    type: str

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    is_on: Optional[bool] = None
    state_value: Optional[str] = None

class DeviceResponse(DeviceBase):
    id: int
    is_on: bool
    state_value: Optional[str] = None
    owner_id: int

    class Config:
        from_attributes = True
