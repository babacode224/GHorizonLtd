import { and, desc, eq, gte, inArray, like, lte, or } from "drizzle-orm";
import {
  listingAuditLog,
  listingDocuments,
  listingImages,
  listings,
  type Listing,
} from "../drizzle/schema";
import { getDb } from "./db";
import { extractYouTubeVideoId, statusForCreation, toSlug } from "./listingPolicy";
import { storagePut } from "./storage";
import { filterSourceProperties, sourcePropertyCatalog } from "./sourceCatalog";

export type UploadedFileInput = {
  fileName: string;
  contentType: string;
  base64: string;
};

export type CreateListingInput = {
  kind: "property" | "vehicle";
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string | null;
  sourceTitle: string;
  description?: string | null;
  price: number;
  location: string;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  purpose?: "sale" | "rent" | "lease" | "let" | null;
  featured?: boolean;
  youtubeUrl?: string | null;
  propertyType?: "land" | "house" | "apartment" | "commercial" | null;
  propertyTitleType?: "certificate_of_occupancy" | "gazette" | "survey_plan" | "deed_of_assignment" | "governors_consent" | null;
  landmarks?: string | null;
  estateName?: string | null;
  propertyCondition?: "newly_built" | "renovated" | "fairly_used" | "off_plan" | null;
  furnishing?: "unfurnished" | "semi_furnished" | "furnished" | null;
  sizeSqm?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  toilets?: number | null;
  parkingSpaces?: number | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  yearBuilt?: number | null;
  rentPeriod?: "month" | "year" | null;
  minimumLeaseMonths?: number | null;
  availableFrom?: Date | null;
  serviceCharge?: number | null;
  securityDeposit?: number | null;
  agencyFee?: number | null;
  legalFee?: number | null;
  cautionFee?: number | null;
  features?: string[];
  make?: string | null;
  model?: string | null;
  vehicleYear?: number | null;
  trim?: string | null;
  color?: string | null;
  vin?: string | null;
  vehicleCondition?: "brand_new" | "foreign_used" | "locally_used" | null;
  mileageKm?: number | null;
  conditionScore?: number | null;
  images?: UploadedFileInput[];
  documents?: UploadedFileInput[];
  clearingPaper?: UploadedFileInput | null;
};

export type ListingFilters = {
  kind: "property" | "vehicle";
  purpose?: "sale" | "rent" | "lease" | "let";
  propertyType?: "land" | "house" | "apartment" | "commercial";
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  make?: string;
  model?: string;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

function nullable(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function safeFileName(fileName: string) {
  const extension = fileName.toLowerCase().match(/\.(?:pdf|jpe?g|png|webp)$/)?.[0] ?? "";
  return `${crypto.randomUUID()}${extension}`;
}

export function decodeUpload(file: UploadedFileInput, allowedTypes: Set<string>) {
  if (!allowedTypes.has(file.contentType)) {
    throw new Error("Unsupported file format.");
  }
  const bytes = Buffer.from(file.base64, "base64");
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) {
    throw new Error("Each upload must be between 1 byte and 10 MB.");
  }
  return bytes;
}

async function uploadOne(file: UploadedFileInput, folder: string, allowedTypes: Set<string>) {
  const bytes = decodeUpload(file, allowedTypes);
  const key = `listings/${folder}/${safeFileName(file.fileName)}`;
  const result = await storagePut(key, bytes, file.contentType);
  return { key: result.key, url: result.url };
}

function enrichListing(row: Listing, images: { url: string; altText: string | null }[]) {
  const title = row.adminTitle ?? row.sourceTitle;
  const displayPrice = Number(row.adminPrice ?? row.price);
  return {
    ...row,
    title,
    displayPrice,
    features: row.features ? (JSON.parse(row.features) as string[]) : [],
    images,
  };
}

async function attachImages(rows: Listing[]) {
  if (!rows.length) return [];
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const imageRows = await db
    .select()
    .from(listingImages)
    .where(inArray(listingImages.listingId, rows.map((row) => row.id)))
    .orderBy(listingImages.sortOrder);
  const imagesByListing = new Map<number, { url: string; altText: string | null }[]>();
  imageRows.forEach((image) => {
    const images = imagesByListing.get(image.listingId) ?? [];
    images.push({ url: image.url, altText: image.altText });
    imagesByListing.set(image.listingId, images);
  });
  return rows.map((row) => enrichListing(row, imagesByListing.get(row.id) ?? []));
}

export async function listPublicListings(filters: ListingFilters) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const conditions = [eq(listings.kind, filters.kind), eq(listings.status, "approved")];
  if (filters.purpose) conditions.push(eq(listings.purpose, filters.purpose));
  if (filters.propertyType) conditions.push(eq(listings.propertyType, filters.propertyType));
  if (filters.city) conditions.push(eq(listings.city, filters.city));
  if (filters.minPrice !== undefined) conditions.push(gte(listings.price, String(filters.minPrice)));
  if (filters.maxPrice !== undefined) conditions.push(lte(listings.price, String(filters.maxPrice)));
  if (filters.make) conditions.push(like(listings.make, `%${filters.make.trim()}%`));
  if (filters.model) conditions.push(like(listings.model, `%${filters.model.trim()}%`));
  if (filters.query?.trim()) {
    const query = `%${filters.query.trim()}%`;
    conditions.push(or(like(listings.sourceTitle, query), like(listings.location, query), like(listings.make, query), like(listings.model, query))!);
  }
  const rows = await db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.featured), desc(listings.createdAt));
  const managedListings = await attachImages(rows);
  if (filters.kind !== "property") return managedListings;
  if (filters.purpose === "lease" || filters.purpose === "let") return managedListings;
  return [...managedListings, ...filterSourceProperties({
    purpose: filters.purpose,
    propertyType: filters.propertyType,
    city: filters.city,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    query: filters.query,
  })];
}

export async function getPublicListingBySlug(kind: "property" | "vehicle", slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db
    .select()
    .from(listings)
    .where(and(eq(listings.kind, kind), eq(listings.slug, slug), eq(listings.status, "approved")))
    .limit(1);
  const persisted = (await attachImages(rows))[0] ?? null;
  if (persisted) return persisted;
  if (kind === "property") return sourcePropertyCatalog.find((listing) => listing.slug === slug) ?? null;
  return null;
}

export async function listAdminListings(status?: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db
    .select()
    .from(listings)
    .where(status ? eq(listings.status, status) : undefined)
    .orderBy(desc(listings.createdAt));
  return attachImages(rows);
}

export async function getAdminListing(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!rows[0]) return null;
  const documents = await db.select().from(listingDocuments).where(eq(listingDocuments.listingId, id));
  const listing = (await attachImages(rows))[0];
  return { ...listing, documents };
}

export async function createListing(input: CreateListingInput, actorUserId: number | null, createdByAdmin: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const now = Date.now();
  const slug = `${toSlug(input.sourceTitle)}-${now.toString(36)}`;
  const status = statusForCreation(createdByAdmin);

  await db.insert(listings).values({
    slug,
    kind: input.kind,
    status,
    purpose: input.purpose ?? null,
    featured: Boolean(input.featured),
    createdByAdmin,
    ownerName: input.ownerName.trim(),
    ownerPhone: input.ownerPhone.trim(),
    ownerEmail: nullable(input.ownerEmail),
    sourceTitle: input.sourceTitle.trim(),
    description: nullable(input.description),
    price: String(input.price),
    location: input.location.trim(),
    city: nullable(input.city),
    latitude: input.latitude === null || input.latitude === undefined ? null : String(input.latitude),
    longitude: input.longitude === null || input.longitude === undefined ? null : String(input.longitude),
    youtubeVideoId: extractYouTubeVideoId(input.youtubeUrl),
    propertyType: input.propertyType ?? null,
    propertyTitleType: input.propertyTitleType ?? null,
    landmarks: nullable(input.landmarks),
    estateName: nullable(input.estateName),
    propertyCondition: input.propertyCondition ?? null,
    furnishing: input.furnishing ?? null,
    sizeSqm: input.sizeSqm === null || input.sizeSqm === undefined ? null : String(input.sizeSqm),
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    toilets: input.toilets ?? null,
    parkingSpaces: input.parkingSpaces ?? null,
    floorNumber: input.floorNumber ?? null,
    totalFloors: input.totalFloors ?? null,
    yearBuilt: input.yearBuilt ?? null,
    rentPeriod: input.rentPeriod ?? null,
    minimumLeaseMonths: input.minimumLeaseMonths ?? null,
    availableFrom: input.availableFrom ?? null,
    serviceCharge: input.serviceCharge === null || input.serviceCharge === undefined ? null : String(input.serviceCharge),
    securityDeposit: input.securityDeposit === null || input.securityDeposit === undefined ? null : String(input.securityDeposit),
    agencyFee: input.agencyFee === null || input.agencyFee === undefined ? null : String(input.agencyFee),
    legalFee: input.legalFee === null || input.legalFee === undefined ? null : String(input.legalFee),
    cautionFee: input.cautionFee === null || input.cautionFee === undefined ? null : String(input.cautionFee),
    features: input.features?.length ? JSON.stringify(input.features) : null,
    make: nullable(input.make),
    model: nullable(input.model),
    vehicleYear: input.vehicleYear ?? null,
    trim: nullable(input.trim),
    color: nullable(input.color),
    vin: nullable(input.vin),
    vehicleCondition: input.vehicleCondition ?? null,
    mileageKm: input.mileageKm ?? null,
    conditionScore: input.conditionScore ?? null,
  });

  const [listing] = await db.select().from(listings).where(eq(listings.slug, slug)).limit(1);
  if (!listing) throw new Error("Unable to create listing");

  const imageFiles = input.images ?? [];
  for (let sortOrder = 0; sortOrder < imageFiles.length; sortOrder += 1) {
    const image = imageFiles[sortOrder];
    if (!image) continue;
    const uploaded = await uploadOne(image, `images/${listing.id}`, IMAGE_TYPES);
    await db.insert(listingImages).values({
      listingId: listing.id,
      storageKey: uploaded.key,
      url: uploaded.url,
      altText: input.sourceTitle.trim(),
      sortOrder,
    });
  }

  for (const document of input.documents ?? []) {
    const uploaded = await uploadOne(document, `documents/${listing.id}`, DOCUMENT_TYPES);
    await db.insert(listingDocuments).values({
      listingId: listing.id,
      storageKey: uploaded.key,
      url: uploaded.url,
      fileName: document.fileName.slice(0, 255),
      contentType: document.contentType,
    });
  }

  if (input.clearingPaper) {
    const uploaded = await uploadOne(input.clearingPaper, `clearing-papers/${listing.id}`, DOCUMENT_TYPES);
    await db
      .update(listings)
      .set({ clearingPaperKey: uploaded.key, clearingPaperUrl: uploaded.url })
      .where(eq(listings.id, listing.id));
  }

  await db.insert(listingAuditLog).values({
    listingId: listing.id,
    actorUserId,
    action: createdByAdmin ? "admin_published" : "submitted",
    oldStatus: null,
    newStatus: status,
    notes: createdByAdmin ? "Published directly by an administrator." : "Submitted for review.",
  });

  return getAdminListing(listing.id);
}

export async function approveListing(
  id: number,
  actorUserId: number | null,
  changes: { adminTitle?: string; adminDescription?: string; adminPrice?: number; adminNotes?: string; featured?: boolean },
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [existing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!existing) throw new Error("Listing not found");
  await db
    .update(listings)
    .set({
      status: "approved",
      adminTitle: nullable(changes.adminTitle),
      adminDescription: nullable(changes.adminDescription),
      adminPrice: changes.adminPrice === undefined ? null : String(changes.adminPrice),
      adminNotes: nullable(changes.adminNotes),
      featured: changes.featured ?? existing.featured,
      rejectionReason: null,
      reviewedByUserId: actorUserId,
      reviewedAt: new Date(),
    })
    .where(eq(listings.id, id));
  await db.insert(listingAuditLog).values({
    listingId: id,
    actorUserId,
    action: "approved",
    oldStatus: existing.status,
    newStatus: "approved",
    notes: nullable(changes.adminNotes),
  });
  return getAdminListing(id);
}

export async function rejectListing(id: number, actorUserId: number | null, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [existing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!existing) throw new Error("Listing not found");
  await db
    .update(listings)
    .set({ status: "rejected", rejectionReason: reason.trim(), reviewedByUserId: actorUserId, reviewedAt: new Date() })
    .where(eq(listings.id, id));
  await db.insert(listingAuditLog).values({
    listingId: id,
    actorUserId,
    action: "rejected",
    oldStatus: existing.status,
    newStatus: "rejected",
    notes: reason.trim(),
  });
}

export async function deleteListing(id: number, actorUserId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [existing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!existing) throw new Error("Listing not found");
  await db.insert(listingAuditLog).values({
    listingId: id,
    actorUserId,
    action: "deleted",
    oldStatus: existing.status,
    newStatus: null,
    notes: "Deleted by administrator.",
  });
  await db.delete(listingImages).where(eq(listingImages.listingId, id));
  await db.delete(listingDocuments).where(eq(listingDocuments.listingId, id));
  await db.delete(listings).where(eq(listings.id, id));
}
