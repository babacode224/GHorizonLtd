import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { contactRequests, inspectionRequests } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { canManageListings } from "./listingPolicy";
import {
  approveListing,
  createListing,
  deleteListing,
  getAdminListing,
  getPublicListingBySlug,
  listAdminListings,
  listPublicListings,
  rejectListing,
  type CreateListingInput,
} from "./listings";

const listingStatus = z.enum(["pending", "approved", "rejected"]);
const propertyKind = z.enum(["land", "house", "apartment", "commercial"]);
const propertyTitle = z.enum(["certificate_of_occupancy", "gazette", "survey_plan", "deed_of_assignment", "governors_consent"]);
const vehicleCondition = z.enum(["brand_new", "foreign_used", "locally_used"]);
const uploadFile = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(1).max(14_000_000),
});

const sharedListingFields = {
  ownerName: z.string().trim().min(2).max(120),
  ownerPhone: z.string().trim().min(7).max(32),
  ownerEmail: z.string().email().max(320).optional().or(z.literal("")),
  sourceTitle: z.string().trim().min(5).max(220),
  description: z.string().trim().max(8_000).optional().or(z.literal("")),
  price: z.number().positive(),
  location: z.string().trim().min(3).max(220),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  purpose: z.enum(["sale", "rent"]).optional(),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(uploadFile).max(10).default([]),
  documents: z.array(uploadFile).max(10).default([]),
};

const propertySubmission = z.object({
  kind: z.literal("property"),
  ...sharedListingFields,
  propertyType: propertyKind,
  propertyTitleType: propertyTitle,
  landmarks: z.string().trim().max(1_000).optional().or(z.literal("")),
  sizeSqm: z.number().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().max(30).optional(),
  bathrooms: z.number().int().nonnegative().max(30).optional(),
  rentPeriod: z.enum(["month", "year"]).optional(),
  features: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
});

const vehicleSubmission = z.object({
  kind: z.literal("vehicle"),
  ...sharedListingFields,
  make: z.string().trim().min(2).max(80),
  model: z.string().trim().min(1).max(100),
  vehicleYear: z.number().int().min(1900).max(2100),
  trim: z.string().trim().max(120).optional().or(z.literal("")),
  color: z.string().trim().max(80).optional().or(z.literal("")),
  vin: z.string().trim().max(17).optional().or(z.literal("")),
  vehicleCondition,
  mileageKm: z.number().int().nonnegative().optional(),
  conditionScore: z.number().int().min(1).max(10).optional(),
  clearingPaper: uploadFile.optional(),
});

const submissionInput = z.discriminatedUnion("kind", [propertySubmission, vehicleSubmission]);
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!canManageListings(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  listings: router({
    publicList: publicProcedure
      .input(z.object({
        kind: z.enum(["property", "vehicle"]),
        purpose: z.enum(["sale", "rent"]).optional(),
        propertyType: propertyKind.optional(),
        city: z.string().trim().min(1).max(120).optional(),
        minPrice: z.number().nonnegative().optional(),
        maxPrice: z.number().positive().optional(),
        query: z.string().trim().max(120).optional(),
        make: z.string().trim().max(80).optional(),
        model: z.string().trim().max(100).optional(),
      }))
      .query(({ input }) => listPublicListings(input)),
    publicBySlug: publicProcedure
      .input(z.object({ kind: z.enum(["property", "vehicle"]), slug: z.string().min(1).max(180) }))
      .query(async ({ input }) => {
        const listing = await getPublicListingBySlug(input.kind, input.slug);
        if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found." });
        return listing;
      }),
    submit: publicProcedure.input(submissionInput).mutation(async ({ input }) => {
      const listing = await createListing(input as CreateListingInput, null, false);
      return { id: listing?.id, status: "pending" as const };
    }),
  }),
  contact: router({
    submitRequest: publicProcedure
      .input(z.object({
        intent: z.enum(["buy", "sell", "rent_out", "lease_out", "build", "consult"]),
        fullName: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(7).max(32),
        email: z.string().email().max(320),
        propertyInterest: z.string().trim().max(80).optional(),
        details: z.string().trim().min(10).max(8_000),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Request storage is currently unavailable." });
        await db.insert(contactRequests).values(input);
        return { success: true };
      }),
    requestInspection: publicProcedure
      .input(z.object({
        requestedDate: z.coerce.date(),
        timeSlot: z.string().trim().min(3).max(16),
        attendanceMode: z.enum(["in_person", "virtual"]),
        fullName: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(7).max(32),
        email: z.string().email().max(320),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Request storage is currently unavailable." });
        await db.insert(inspectionRequests).values(input);
        return { success: true };
      }),
  }),
  admin: router({
    list: adminProcedure.input(z.object({ status: listingStatus.optional() })).query(({ input }) => listAdminListings(input.status)),
    byId: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const listing = await getAdminListing(input.id);
      if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found." });
      return listing;
    }),
    approve: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        adminTitle: z.string().trim().min(5).max(220).optional(),
        adminDescription: z.string().trim().max(8_000).optional(),
        adminPrice: z.number().positive().optional(),
        adminNotes: z.string().trim().max(8_000).optional(),
        featured: z.boolean().optional(),
      }))
      .mutation(({ input, ctx }) => approveListing(input.id, ctx.user.id, input)),
    reject: adminProcedure
      .input(z.object({ id: z.number().int().positive(), reason: z.string().trim().min(5).max(2_000) }))
      .mutation(async ({ input, ctx }) => {
        await rejectListing(input.id, ctx.user.id, input.reason);
        return { success: true };
      }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      await deleteListing(input.id, ctx.user.id);
      return { success: true };
    }),
    directCreate: adminProcedure
      .input(z.object({ listing: submissionInput, featured: z.boolean().default(false) }))
      .mutation(({ input, ctx }) => createListing({ ...input.listing, featured: input.featured } as CreateListingInput, ctx.user.id, true)),
  }),
});

export type AppRouter = typeof appRouter;
