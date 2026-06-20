-- =============================================================================
-- ListingsPipeline — PostgreSQL Schema
-- Dual-vertical: Real Estate & Vehicle Sales
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
CREATE TYPE listing_status AS ENUM ('Pending Review', 'Published', 'Rejected');
CREATE TYPE property_type   AS ENUM ('Land', 'House', 'Apartment', 'Commercial');
CREATE TYPE title_type      AS ENUM ('C of O', 'Gazette', 'Survey Plan', 'Deed of Assignment', 'Governor Consent');
CREATE TYPE vehicle_condition AS ENUM ('Brand New', 'Foreign Used', 'Locally Used');

-- ---------------------------------------------------------------------------
-- ADMIN USERS  (platform owner accounts only — no self-registration)
-- ---------------------------------------------------------------------------
CREATE TABLE admin_users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PROPERTIES
-- ---------------------------------------------------------------------------
CREATE TABLE properties (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Submitter contact (not a registered user — just contact info)
    owner_name        TEXT NOT NULL,
    owner_phone       TEXT NOT NULL,
    owner_email       TEXT,

    -- Listing details
    type              property_type NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT,
    price             NUMERIC(18, 2) NOT NULL,
    location          TEXT NOT NULL,
    landmarks         TEXT,                    -- nearby landmarks (comma-separated or prose)
    size_sqm          NUMERIC(12, 2),

    -- Legal documents
    title_type        title_type NOT NULL,
    document_urls     TEXT[] NOT NULL DEFAULT '{}', -- secure storage URLs (deeds, C of O scans, etc.)

    -- Media
    image_urls        TEXT[] NOT NULL DEFAULT '{}',
    youtube_video_id  TEXT,                    -- e.g. "dQw4w9WgXcQ" extracted from YouTube URL

    -- Admin-editable copy (admin can rewrite before publishing)
    admin_title       TEXT,
    admin_description TEXT,
    admin_price       NUMERIC(18, 2),
    admin_notes       TEXT,

    -- Pipeline state
    status            listing_status NOT NULL DEFAULT 'Pending Review',
    rejection_reason  TEXT,
    reviewed_by       UUID REFERENCES admin_users(id),
    reviewed_at       TIMESTAMPTZ,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- VEHICLES
-- ---------------------------------------------------------------------------
CREATE TABLE vehicles (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Submitter contact
    owner_name            TEXT NOT NULL,
    owner_phone           TEXT NOT NULL,
    owner_email           TEXT,

    -- Listing details
    make                  TEXT NOT NULL,       -- e.g. Toyota
    model                 TEXT NOT NULL,       -- e.g. Camry
    year                  SMALLINT NOT NULL,
    trim                  TEXT,               -- e.g. XSE V6
    color                 TEXT,
    vin                   TEXT,               -- Vehicle Identification Number
    mileage_km            INTEGER,
    condition             vehicle_condition NOT NULL,
    condition_score       SMALLINT CHECK (condition_score BETWEEN 1 AND 10),
    price                 NUMERIC(18, 2) NOT NULL,
    description           TEXT,
    location              TEXT NOT NULL,

    -- Legal documents
    clearing_papers_url   TEXT,               -- customs clearing certificate URL
    document_urls         TEXT[] NOT NULL DEFAULT '{}',

    -- Media
    image_urls            TEXT[] NOT NULL DEFAULT '{}',
    youtube_video_id      TEXT,

    -- Admin-editable copy
    admin_title           TEXT,
    admin_description     TEXT,
    admin_price           NUMERIC(18, 2),
    admin_notes           TEXT,

    -- Pipeline state
    status                listing_status NOT NULL DEFAULT 'Pending Review',
    rejection_reason      TEXT,
    reviewed_by           UUID REFERENCES admin_users(id),
    reviewed_at           TIMESTAMPTZ,

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- AUDIT LOG  (every status transition is recorded)
-- ---------------------------------------------------------------------------
CREATE TABLE submission_audit_log (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type    TEXT NOT NULL CHECK (entity_type IN ('property', 'vehicle')),
    entity_id      UUID NOT NULL,
    old_status     listing_status,
    new_status     listing_status NOT NULL,
    action_by      UUID REFERENCES admin_users(id),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TRIGGERS — auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
-- Public feed: only Published records are queried
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_vehicles_status    ON vehicles(status);

-- Admin queue: Pending Review sorted by submission time
CREATE INDEX idx_properties_pending ON properties(created_at DESC) WHERE status = 'Pending Review';
CREATE INDEX idx_vehicles_pending   ON vehicles(created_at DESC)   WHERE status = 'Pending Review';

-- Audit lookups
CREATE INDEX idx_audit_entity ON submission_audit_log(entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- SEED: default admin account (password: Admin@12345 — CHANGE IN PRODUCTION)
-- ---------------------------------------------------------------------------
INSERT INTO admin_users (email, password_hash, full_name)
VALUES (
    'admin@listingspipeline.com',
    crypt('Admin@12345', gen_salt('bf', 12)),
    'Platform Owner'
);
