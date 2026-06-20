"""
Admin-only endpoints — JWT-protected.
"""
from datetime import timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import AdminUser, Property, Vehicle, ListingStatus, SubmissionAuditLog
from schemas import (
    AdminLoginRequest, TokenResponse,
    AdminPublishRequest, AdminRejectRequest,
    PropertyResponse, VehicleResponse,
)
from auth import verify_password, create_access_token, get_current_admin, hash_password
from config import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
@router.post("/auth/login", response_model=TokenResponse)
async def admin_login(body: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminUser).where(AdminUser.email == body.email))
    admin = result.scalar_one_or_none()
    if not admin or not verify_password(body.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not admin.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    token = create_access_token(
        data={"sub": str(admin.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(access_token=token)

# ---------------------------------------------------------------------------
# GET /api/admin/submissions — pending queue
# ---------------------------------------------------------------------------
@router.get("/submissions")
async def list_pending_submissions(
    vertical: Optional[str] = Query(None, regex="^(property|vehicle)$"),
    page:     int = Query(1, ge=1),
    limit:    int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    offset = (page - 1) * limit
    results = {}

    if vertical in (None, "property"):
        q = select(Property).where(Property.status == ListingStatus.PENDING).order_by(Property.created_at.asc())
        total_q = select(func.count()).select_from(Property).where(Property.status == ListingStatus.PENDING)
        rows  = (await db.execute(q.offset(offset).limit(limit))).scalars().all()
        total = (await db.execute(total_q)).scalar_one()
        results["properties"] = {"total": total, "items": [PropertyResponse.model_validate(r) for r in rows]}

    if vertical in (None, "vehicle"):
        q = select(Vehicle).where(Vehicle.status == ListingStatus.PENDING).order_by(Vehicle.created_at.asc())
        total_q = select(func.count()).select_from(Vehicle).where(Vehicle.status == ListingStatus.PENDING)
        rows  = (await db.execute(q.offset(offset).limit(limit))).scalars().all()
        total = (await db.execute(total_q)).scalar_one()
        results["vehicles"] = {"total": total, "items": [VehicleResponse.model_validate(r) for r in rows]}

    return results

# ---------------------------------------------------------------------------
# GET /api/admin/submissions/:type/:id — single item detail
# ---------------------------------------------------------------------------
@router.get("/submissions/property/{id}", response_model=PropertyResponse)
async def get_property_detail(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    row = (await db.execute(select(Property).where(Property.id == id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, detail="Property not found")
    return row

@router.get("/submissions/vehicle/{id}", response_model=VehicleResponse)
async def get_vehicle_detail(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    row = (await db.execute(select(Vehicle).where(Vehicle.id == id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, detail="Vehicle not found")
    return row

# ---------------------------------------------------------------------------
# PUT /api/admin/submissions/property/:id/publish
# ---------------------------------------------------------------------------
@router.put("/submissions/property/{id}/publish", response_model=PropertyResponse)
async def publish_property(
    id:   UUID,
    body: AdminPublishRequest,
    db:   AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return await _change_status(db, admin, "property", id, ListingStatus.PUBLISHED, body=body)

@router.put("/submissions/vehicle/{id}/publish", response_model=VehicleResponse)
async def publish_vehicle(
    id:   UUID,
    body: AdminPublishRequest,
    db:   AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return await _change_status(db, admin, "vehicle", id, ListingStatus.PUBLISHED, body=body)

# ---------------------------------------------------------------------------
# PUT /api/admin/submissions/property/:id/reject
# ---------------------------------------------------------------------------
@router.put("/submissions/property/{id}/reject", response_model=PropertyResponse)
async def reject_property(
    id:   UUID,
    body: AdminRejectRequest,
    db:   AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return await _change_status(db, admin, "property", id, ListingStatus.REJECTED, reason=body.rejection_reason)

@router.put("/submissions/vehicle/{id}/reject", response_model=VehicleResponse)
async def reject_vehicle(
    id:   UUID,
    body: AdminRejectRequest,
    db:   AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return await _change_status(db, admin, "vehicle", id, ListingStatus.REJECTED, reason=body.rejection_reason)

# ---------------------------------------------------------------------------
# Shared helper
# ---------------------------------------------------------------------------
async def _change_status(
    db: AsyncSession,
    admin: AdminUser,
    entity_type: str,
    entity_id: UUID,
    new_status: ListingStatus,
    body: Optional[AdminPublishRequest] = None,
    reason: Optional[str] = None,
):
    from datetime import datetime

    Model = Property if entity_type == "property" else Vehicle
    result = await db.execute(select(Model).where(Model.id == entity_id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(404, detail=f"{entity_type.capitalize()} not found")

    old_status = obj.status

    if body:
        if body.admin_title:       obj.admin_title       = body.admin_title
        if body.admin_description: obj.admin_description = body.admin_description
        if body.admin_price:       obj.admin_price       = body.admin_price
        if body.admin_notes:       obj.admin_notes       = body.admin_notes

    obj.status      = new_status
    obj.reviewed_by = admin.id
    obj.reviewed_at = datetime.utcnow()
    if reason:
        obj.rejection_reason = reason

    log = SubmissionAuditLog(
        entity_type = entity_type,
        entity_id   = entity_id,
        old_status  = old_status,
        new_status  = new_status,
        action_by   = admin.id,
        notes       = reason,
    )
    db.add(log)
    await db.flush()
    await db.refresh(obj)
    return obj
