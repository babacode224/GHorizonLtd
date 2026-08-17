export type ListingStatus = "pending" | "approved" | "rejected";

export function statusForCreation(createdByAdmin: boolean): ListingStatus {
  return createdByAdmin ? "approved" : "pending";
}

export function isPubliclyVisible(status: ListingStatus): boolean {
  return status === "approved";
}

export function canManageListings(role: string | null | undefined): boolean {
  return role === "admin";
}

export function extractYouTubeVideoId(value?: string | null): string | null {
  if (!value) return null;
  const match = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export function toSlug(value: string): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
  return normalized || "listing";
}
