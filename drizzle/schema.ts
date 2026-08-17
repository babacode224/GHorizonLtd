import {
  bigint,
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Identity table supplied by the Manus OAuth template. The project owner is
 * promoted to admin by the authentication bootstrap in server/db.ts.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const listingKinds = ["property", "vehicle"] as const;
export const listingStatuses = ["pending", "approved", "rejected"] as const;
export const listingPurposes = ["sale", "rent", "lease", "let"] as const;
export const propertyTypes = ["land", "house", "apartment", "commercial"] as const;
export const propertyConditions = ["newly_built", "renovated", "fairly_used", "off_plan"] as const;
export const furnishingLevels = ["unfurnished", "semi_furnished", "furnished"] as const;
export const propertyTitleTypes = [
  "certificate_of_occupancy",
  "gazette",
  "survey_plan",
  "deed_of_assignment",
  "governors_consent",
] as const;
export const vehicleConditions = ["brand_new", "foreign_used", "locally_used"] as const;

/**
 * A normalized superset of the original property and vehicle records. Domain
 * columns that do not apply to one kind remain null, while public discovery is
 * always constrained to status = approved by the server procedures.
 */
export const listings = mysqlTable(
  "listings",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 180 }).notNull(),
    kind: mysqlEnum("kind", listingKinds).notNull(),
    status: mysqlEnum("status", listingStatuses).default("pending").notNull(),
    purpose: mysqlEnum("purpose", listingPurposes),
    featured: boolean("featured").default(false).notNull(),
    createdByAdmin: boolean("createdByAdmin").default(false).notNull(),

    ownerName: varchar("ownerName", { length: 120 }).notNull(),
    ownerPhone: varchar("ownerPhone", { length: 32 }).notNull(),
    ownerEmail: varchar("ownerEmail", { length: 320 }),

    sourceTitle: varchar("sourceTitle", { length: 220 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 18, scale: 2 }).notNull(),
    location: varchar("location", { length: 220 }).notNull(),
    city: varchar("city", { length: 120 }),
    youtubeVideoId: varchar("youtubeVideoId", { length: 32 }),

    propertyType: mysqlEnum("propertyType", propertyTypes),
    propertyTitleType: mysqlEnum("propertyTitleType", propertyTitleTypes),
    landmarks: text("landmarks"),
    estateName: varchar("estateName", { length: 180 }),
    propertyCondition: mysqlEnum("propertyCondition", propertyConditions),
    furnishing: mysqlEnum("furnishing", furnishingLevels),
    sizeSqm: decimal("sizeSqm", { precision: 14, scale: 2 }),
    bedrooms: int("bedrooms"),
    bathrooms: int("bathrooms"),
    toilets: int("toilets"),
    parkingSpaces: int("parkingSpaces"),
    floorNumber: int("floorNumber"),
    totalFloors: int("totalFloors"),
    yearBuilt: int("yearBuilt"),
    rentPeriod: mysqlEnum("rentPeriod", ["month", "year"]),
    minimumLeaseMonths: int("minimumLeaseMonths"),
    availableFrom: timestamp("availableFrom"),
    serviceCharge: decimal("serviceCharge", { precision: 18, scale: 2 }),
    securityDeposit: decimal("securityDeposit", { precision: 18, scale: 2 }),
    agencyFee: decimal("agencyFee", { precision: 18, scale: 2 }),
    legalFee: decimal("legalFee", { precision: 18, scale: 2 }),
    cautionFee: decimal("cautionFee", { precision: 18, scale: 2 }),
    features: text("features"),

    make: varchar("make", { length: 80 }),
    model: varchar("model", { length: 100 }),
    vehicleYear: int("vehicleYear"),
    trim: varchar("trim", { length: 120 }),
    color: varchar("color", { length: 80 }),
    vin: varchar("vin", { length: 17 }),
    vehicleCondition: mysqlEnum("vehicleCondition", vehicleConditions),
    mileageKm: bigint("mileageKm", { mode: "number" }),
    conditionScore: int("conditionScore"),
    clearingPaperUrl: varchar("clearingPaperUrl", { length: 1024 }),
    clearingPaperKey: varchar("clearingPaperKey", { length: 512 }),

    adminTitle: varchar("adminTitle", { length: 220 }),
    adminDescription: text("adminDescription"),
    adminPrice: decimal("adminPrice", { precision: 18, scale: 2 }),
    adminNotes: text("adminNotes"),
    rejectionReason: text("rejectionReason"),
    reviewedByUserId: int("reviewedByUserId"),
    reviewedAt: timestamp("reviewedAt"),

    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("listings_slug_unique").on(table.slug),
    index("listings_public_feed_idx").on(table.kind, table.status, table.createdAt),
    index("listings_admin_queue_idx").on(table.status, table.createdAt),
    index("listings_location_idx").on(table.city, table.location),
    index("listings_price_idx").on(table.price),
  ],
);

export const listingImages = mysqlTable(
  "listing_images",
  {
    id: int("id").autoincrement().primaryKey(),
    listingId: int("listingId").notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    altText: varchar("altText", { length: 280 }),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("listing_images_listing_idx").on(table.listingId, table.sortOrder),
  ],
);

export const listingDocuments = mysqlTable(
  "listing_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    listingId: int("listingId").notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    contentType: varchar("contentType", { length: 160 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("listing_documents_listing_idx").on(table.listingId)],
);

export const listingAuditLog = mysqlTable(
  "listing_audit_log",
  {
    id: int("id").autoincrement().primaryKey(),
    listingId: int("listingId").notNull(),
    actorUserId: int("actorUserId"),
    action: mysqlEnum("action", ["submitted", "approved", "rejected", "deleted", "admin_published"])
      .notNull(),
    oldStatus: mysqlEnum("oldStatus", listingStatuses),
    newStatus: mysqlEnum("newStatus", listingStatuses),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("listing_audit_log_listing_idx").on(table.listingId, table.createdAt),
  ],
);

export const contactRequests = mysqlTable(
  "contact_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    intent: mysqlEnum("intent", ["buy", "sell", "rent_out", "lease_out", "build", "consult"]).notNull(),
    fullName: varchar("fullName", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    propertyInterest: varchar("propertyInterest", { length: 80 }),
    details: text("details").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("contact_requests_created_idx").on(table.createdAt)],
);

export const inspectionRequests = mysqlTable(
  "inspection_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    requestedDate: timestamp("requestedDate").notNull(),
    timeSlot: varchar("timeSlot", { length: 16 }).notNull(),
    attendanceMode: mysqlEnum("attendanceMode", ["in_person", "virtual"]).notNull(),
    fullName: varchar("fullName", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("inspection_requests_date_idx").on(table.requestedDate)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;
export type ListingImage = typeof listingImages.$inferSelect;
export type ListingDocument = typeof listingDocuments.$inferSelect;
