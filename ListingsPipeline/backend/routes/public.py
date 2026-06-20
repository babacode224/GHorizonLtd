"""
Public discovery endpoints — only Published listings are ever returned.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Property, Vehicle, ListingStatus, PropertyType, VehicleCondition
from schemas import PropertyResponse, VehicleResponse

router = APIRouter(prefix="/api", tags=["public"])

# ---------------------------------------------------------------------------
# GET /api/properties — public feed, Published only
# ---------------------------------------------------------------------------
@router.get("/properties")
async def list_properties(
    type:      Optional[PropertyType] = Query(None),
    location:  Optional[str]          = Query(None),
    min_price: Optional[float]        = Query(None, ge=0),
    max_price: Optional[float]        = Query(None, ge=0),
    page:      int                    = Query(1, ge=1),
    limit:     int                    = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    # ── HARD WHERE status = 'Published' ───────────────────────────────────
    q = select(Property).where(Property.status == ListingStatus.PUBLISHED)

    if type:      q = q.where(Property.type == type)
    if location:  q = q.where(Property.location.ilike(f"%{location}%"))
    if min_price: q = q.where(Property.price >= min_price)
    if max_price: q = q.where(Property.price <= max_price)

    total = (await db.execute(
        select(func.count()).select_from(q.subquery())
    )).scalar_one()

    rows = (await db.execute(
        q.order_by(Property.reviewed_at.desc()).offset((page-1)*limit).limit(limit)
    )).scalars().all()

    # Return admin-edited copy if available, falling back to owner-submitted
    def serialize(p: Property) -> dict:
        d = PropertyResponse.model_validate(p).model_dump()
        d["display_title"]       = p.admin_title       or p.title
        d["display_description"] = p.admin_description or p.description
        d["display_price"]       = float(p.admin_price or p.price)
        return d

    return {"total": total, "page": page, "limit": limit, "items": [serialize(r) for r in rows]}

# ---------------------------------------------------------------------------
# GET /api/vehicles — public feed, Published only
# ---------------------------------------------------------------------------
@router.get("/vehicles")
async def list_vehicles(
    condition:  Optional[VehicleCondition] = Query(None),
    make:       Optional[str]              = Query(None),
    location:   Optional[str]             = Query(None),
    min_price:  Optional[float]           = Query(None, ge=0),
    max_price:  Optional[float]           = Query(None, ge=0),
    min_year:   Optional[int]             = Query(None),
    max_year:   Optional[int]             = Query(None),
    page:       int                       = Query(1, ge=1),
    limit:      int                       = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    # ── HARD WHERE status = 'Published' ───────────────────────────────────
    q = select(Vehicle).where(Vehicle.status == ListingStatus.PUBLISHED)

    if condition:  q = q.where(Vehicle.condition == condition)
    if make:       q = q.where(Vehicle.make.ilike(f"%{make}%"))
    if location:   q = q.where(Vehicle.location.ilike(f"%{location}%"))
    if min_price:  q = q.where(Vehicle.price >= min_price)
    if max_price:  q = q.where(Vehicle.price <= max_price)
    if min_year:   q = q.where(Vehicle.year >= min_year)
    if max_year:   q = q.where(Vehicle.year <= max_year)

    total = (await db.execute(
        select(func.count()).select_from(q.subquery())
    )).scalar_one()

    rows = (await db.execute(
        q.order_by(Vehicle.reviewed_at.desc()).offset((page-1)*limit).limit(limit)
    )).scalars().all()

    def serialize(v: Vehicle) -> dict:
        d = VehicleResponse.model_validate(v).model_dump()
        d["display_title"]       = v.admin_title or f"{v.year} {v.make} {v.model}"
        d["display_description"] = v.admin_description or v.description
        d["display_price"]       = float(v.admin_price or v.price)
        return d

    return {"total": total, "page": page, "limit": limit, "items": [serialize(r) for r in rows]}
