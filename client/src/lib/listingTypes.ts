export type ListingKind = "property" | "vehicle";

export type PublicListing = {
  id: number;
  slug: string;
  kind: ListingKind;
  purpose: "sale" | "rent" | null;
  featured: boolean;
  title: string;
  sourceTitle: string;
  displayPrice: number;
  location: string;
  city: string | null;
  description: string | null;
  propertyType: "land" | "house" | "apartment" | "commercial" | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: string | null;
  rentPeriod: "month" | "year" | null;
  features: string[];
  make: string | null;
  model: string | null;
  vehicleYear: number | null;
  trim: string | null;
  color: string | null;
  mileageKm: number | null;
  vehicleCondition: "brand_new" | "foreign_used" | "locally_used" | null;
  youtubeVideoId: string | null;
  images: { url: string; altText: string | null }[];
};

export const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function priceLabel(listing: Pick<PublicListing, "displayPrice" | "purpose" | "rentPeriod">) {
  const base = currency.format(listing.displayPrice);
  return listing.purpose === "rent" ? `${base}/${listing.rentPeriod === "month" ? "mo" : "yr"}` : base;
}

export function listingImage(listing: Pick<PublicListing, "images" | "kind">) {
  return (
    listing.images[0]?.url ??
    (listing.kind === "property"
      ? "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85"
      : "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85")
  );
}
