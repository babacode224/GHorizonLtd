import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Numeric, SmallInteger, Integer,
    Boolean, DateTime, ForeignKey, Enum as PgEnum, ARRAY, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
import enum

class ListingStatus(str, enum.Enum):
    PENDING  = "Pending Review"
    PUBLISHED = "Published"
    REJECTED  = "Rejected"

class PropertyType(str, enum.Enum):
    LAND       = "Land"
    HOUSE      = "House"
    APARTMENT  = "Apartment"
    COMMERCIAL = "Commercial"

class TitleType(str, enum.Enum):
    COO              = "C of O"
    GAZETTE          = "Gazette"
    SURVEY_PLAN      = "Survey Plan"
    DEED_ASSIGNMENT  = "Deed of Assignment"
    GOVERNOR_CONSENT = "Governor Consent"

class VehicleCondition(str, enum.Enum):
    BRAND_NEW     = "Brand New"
    FOREIGN_USED  = "Foreign Used"
    LOCALLY_USED  = "Locally Used"

class AdminUser(Base):
    __tablename__ = "admin_users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    full_name     = Column(String, nullable=False)
    is_active     = Column(Boolean, nullable=False, default=True)
    created_at    = Column(DateTime(timezone=True), default=datetime.utcnow)

class Property(Base):
    __tablename__ = "properties"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_name        = Column(String, nullable=False)
    owner_phone       = Column(String, nullable=False)
    owner_email       = Column(String)
    type              = Column(PgEnum(PropertyType, name="property_type"), nullable=False)
    title             = Column(String, nullable=False)
    description       = Column(Text)
    price             = Column(Numeric(18, 2), nullable=False)
    location          = Column(String, nullable=False)
    landmarks         = Column(Text)
    size_sqm          = Column(Numeric(12, 2))
    title_type        = Column(PgEnum(TitleType, name="title_type"), nullable=False)
    document_urls     = Column(ARRAY(Text), nullable=False, default=[])
    image_urls        = Column(ARRAY(Text), nullable=False, default=[])
    youtube_video_id  = Column(String)
    admin_title       = Column(String)
    admin_description = Column(Text)
    admin_price       = Column(Numeric(18, 2))
    admin_notes       = Column(Text)
    status            = Column(PgEnum(ListingStatus, name="listing_status"), nullable=False, default=ListingStatus.PENDING)
    rejection_reason  = Column(Text)
    reviewed_by       = Column(UUID(as_uuid=True), ForeignKey("admin_users.id"))
    reviewed_at       = Column(DateTime(timezone=True))
    created_at        = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at        = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id                   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_name           = Column(String, nullable=False)
    owner_phone          = Column(String, nullable=False)
    owner_email          = Column(String)
    make                 = Column(String, nullable=False)
    model                = Column(String, nullable=False)
    year                 = Column(SmallInteger, nullable=False)
    trim                 = Column(String)
    color                = Column(String)
    vin                  = Column(String)
    mileage_km           = Column(Integer)
    condition            = Column(PgEnum(VehicleCondition, name="vehicle_condition"), nullable=False)
    condition_score      = Column(SmallInteger)
    price                = Column(Numeric(18, 2), nullable=False)
    description          = Column(Text)
    location             = Column(String, nullable=False)
    clearing_papers_url  = Column(String)
    document_urls        = Column(ARRAY(Text), nullable=False, default=[])
    image_urls           = Column(ARRAY(Text), nullable=False, default=[])
    youtube_video_id     = Column(String)
    admin_title          = Column(String)
    admin_description    = Column(Text)
    admin_price          = Column(Numeric(18, 2))
    admin_notes          = Column(Text)
    status               = Column(PgEnum(ListingStatus, name="listing_status"), nullable=False, default=ListingStatus.PENDING)
    rejection_reason     = Column(Text)
    reviewed_by          = Column(UUID(as_uuid=True), ForeignKey("admin_users.id"))
    reviewed_at          = Column(DateTime(timezone=True))
    created_at           = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at           = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("condition_score BETWEEN 1 AND 10", name="ck_condition_score"),
    )

class SubmissionAuditLog(Base):
    __tablename__ = "submission_audit_log"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String, nullable=False)
    entity_id   = Column(UUID(as_uuid=True), nullable=False)
    old_status  = Column(PgEnum(ListingStatus, name="listing_status"))
    new_status  = Column(PgEnum(ListingStatus, name="listing_status"), nullable=False)
    action_by   = Column(UUID(as_uuid=True), ForeignKey("admin_users.id"))
    notes       = Column(Text)
    created_at  = Column(DateTime(timezone=True), default=datetime.utcnow)
