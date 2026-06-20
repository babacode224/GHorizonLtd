from __future__ import annotations
from decimal import Decimal
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

from models import ListingStatus, PropertyType, TitleType, VehicleCondition

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class AdminLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---------------------------------------------------------------------------
# Property submission (public — no auth)
# ---------------------------------------------------------------------------
class PropertySubmitRequest(BaseModel):
    owner_name:   str  = Field(..., min_length=2, max_length=100)
    owner_phone:  str  = Field(..., min_length=7, max_length=20)
    owner_email:  Optional[str] = None
    type:         PropertyType
    title:        str  = Field(..., min_length=5, max_length=200)
    description:  Optional[str] = None
    price:        Decimal = Field(..., gt=0)
    location:     str  = Field(..., min_length=3)
    landmarks:    Optional[str] = None
    size_sqm:     Optional[Decimal] = None
    title_type:   TitleType
    youtube_url:  Optional[str] = None   # full URL — backend extracts video ID

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        pattern = r"(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})"
        if not re.search(pattern, v):
            raise ValueError("Invalid YouTube URL")
        return v

class PropertyResponse(BaseModel):
    id:               UUID
    owner_name:       str
    owner_phone:      str
    owner_email:      Optional[str]
    type:             PropertyType
    title:            str
    description:      Optional[str]
    price:            Decimal
    location:         str
    landmarks:        Optional[str]
    size_sqm:         Optional[Decimal]
    title_type:       TitleType
    document_urls:    List[str]
    image_urls:       List[str]
    youtube_video_id: Optional[str]
    admin_title:      Optional[str]
    admin_description:Optional[str]
    admin_price:      Optional[Decimal]
    admin_notes:      Optional[str]
    status:           ListingStatus
    rejection_reason: Optional[str]
    created_at:       datetime
    updated_at:       datetime

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Vehicle submission (public — no auth)
# ---------------------------------------------------------------------------
class VehicleSubmitRequest(BaseModel):
    owner_name:      str     = Field(..., min_length=2, max_length=100)
    owner_phone:     str     = Field(..., min_length=7, max_length=20)
    owner_email:     Optional[str] = None
    make:            str     = Field(..., min_length=2, max_length=50)
    model:           str     = Field(..., min_length=1, max_length=50)
    year:            int     = Field(..., ge=1900, le=2100)
    trim:            Optional[str] = None
    color:           Optional[str] = None
    vin:             Optional[str] = Field(None, max_length=17)
    mileage_km:      Optional[int] = Field(None, ge=0)
    condition:       VehicleCondition
    condition_score: Optional[int] = Field(None, ge=1, le=10)
    price:           Decimal = Field(..., gt=0)
    description:     Optional[str] = None
    location:        str     = Field(..., min_length=3)
    youtube_url:     Optional[str] = None

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        pattern = r"(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})"
        if not re.search(pattern, v):
            raise ValueError("Invalid YouTube URL")
        return v

class VehicleResponse(BaseModel):
    id:                  UUID
    owner_name:          str
    owner_phone:         str
    owner_email:         Optional[str]
    make:                str
    model:               str
    year:                int
    trim:                Optional[str]
    color:               Optional[str]
    vin:                 Optional[str]
    mileage_km:          Optional[int]
    condition:           VehicleCondition
    condition_score:     Optional[int]
    price:               Decimal
    description:         Optional[str]
    location:            str
    clearing_papers_url: Optional[str]
    document_urls:       List[str]
    image_urls:          List[str]
    youtube_video_id:    Optional[str]
    admin_title:         Optional[str]
    admin_description:   Optional[str]
    admin_price:         Optional[Decimal]
    admin_notes:         Optional[str]
    status:              ListingStatus
    rejection_reason:    Optional[str]
    created_at:          datetime
    updated_at:          datetime

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Admin actions
# ---------------------------------------------------------------------------
class AdminPublishRequest(BaseModel):
    admin_title:       Optional[str] = None
    admin_description: Optional[str] = None
    admin_price:       Optional[Decimal] = None
    admin_notes:       Optional[str] = None

class AdminRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=5)

# ---------------------------------------------------------------------------
# Pagination wrapper
# ---------------------------------------------------------------------------
class PaginatedResponse(BaseModel):
    total: int
    page:  int
    limit: int
    items: list
