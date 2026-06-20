"""
Public submission endpoints — no authentication required.
Status is HARD-CODED to 'Pending Review' on insert.
"""
import re
import json
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Property, Vehicle, ListingStatus, PropertyType, TitleType, VehicleCondition
from schemas import PropertyResponse, VehicleResponse
from storage import upload_file

router = APIRouter(prefix="/api/submissions", tags=["submissions"])

def _extract_youtube_id(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    m = re.search(r"(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})", url)
    return m.group(1) if m else None

# ---------------------------------------------------------------------------
# POST /api/submissions/property
# ---------------------------------------------------------------------------
@router.post("/property", response_model=PropertyResponse, status_code=201)
async def submit_property(
    # Form fields
    owner_name:   str = Form(...),
    owner_phone:  str = Form(...),
    owner_email:  Optional[str] = Form(None),
    type:         PropertyType = Form(...),
    title:        str = Form(...),
    description:  Optional[str] = Form(None),
    price:        float = Form(..., gt=0),
    location:     str = Form(...),
    landmarks:    Optional[str] = Form(None),
    size_sqm:     Optional[float] = Form(None),
    title_type:   TitleType = Form(...),
    youtube_url:  Optional[str] = Form(None),
    # File uploads
    documents: List[UploadFile] = File(default=[]),
    images:    List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
):
    doc_urls   = [await upload_file(f, folder="property/documents") for f in documents if f.filename]
    image_urls = [await upload_file(f, folder="property/images")    for f in images    if f.filename]

    prop = Property(
        owner_name       = owner_name,
        owner_phone      = owner_phone,
        owner_email      = owner_email,
        type             = type,
        title            = title,
        description      = description,
        price            = price,
        location         = location,
        landmarks        = landmarks,
        size_sqm         = size_sqm,
        title_type       = title_type,
        youtube_video_id = _extract_youtube_id(youtube_url),
        document_urls    = doc_urls,
        image_urls       = image_urls,
        # ── Enforced pipeline entry state ──────────────────────────────────
        status           = ListingStatus.PENDING,
    )
    db.add(prop)
    await db.flush()
    await db.refresh(prop)
    return prop

# ---------------------------------------------------------------------------
# POST /api/submissions/vehicle
# ---------------------------------------------------------------------------
@router.post("/vehicle", response_model=VehicleResponse, status_code=201)
async def submit_vehicle(
    owner_name:      str = Form(...),
    owner_phone:     str = Form(...),
    owner_email:     Optional[str] = Form(None),
    make:            str = Form(...),
    model:           str = Form(...),
    year:            int = Form(..., ge=1900, le=2100),
    trim:            Optional[str] = Form(None),
    color:           Optional[str] = Form(None),
    vin:             Optional[str] = Form(None),
    mileage_km:      Optional[int] = Form(None, ge=0),
    condition:       VehicleCondition = Form(...),
    condition_score: Optional[int] = Form(None, ge=1, le=10),
    price:           float = Form(..., gt=0),
    description:     Optional[str] = Form(None),
    location:        str = Form(...),
    youtube_url:     Optional[str] = Form(None),
    # File uploads
    clearing_papers: Optional[UploadFile] = File(None),
    documents: List[UploadFile] = File(default=[]),
    images:    List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
):
    clearing_url = None
    if clearing_papers and clearing_papers.filename:
        clearing_url = await upload_file(clearing_papers, folder="vehicle/clearing")

    doc_urls   = [await upload_file(f, folder="vehicle/documents") for f in documents if f.filename]
    image_urls = [await upload_file(f, folder="vehicle/images")    for f in images    if f.filename]

    vehicle = Vehicle(
        owner_name          = owner_name,
        owner_phone         = owner_phone,
        owner_email         = owner_email,
        make                = make,
        model               = model,
        year                = year,
        trim                = trim,
        color               = color,
        vin                 = vin,
        mileage_km          = mileage_km,
        condition           = condition,
        condition_score     = condition_score,
        price               = price,
        description         = description,
        location            = location,
        clearing_papers_url = clearing_url,
        document_urls       = doc_urls,
        image_urls          = image_urls,
        youtube_video_id    = _extract_youtube_id(youtube_url),
        # ── Enforced pipeline entry state ──────────────────────────────────
        status              = ListingStatus.PENDING,
    )
    db.add(vehicle)
    await db.flush()
    await db.refresh(vehicle)
    return vehicle
