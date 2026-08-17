export type ListingKind = "property" | "vehicle";

export type PublicListing = {
  id: number;
  slug: string;
  kind: ListingKind;
  purpose: "sale" | "rent" | "lease" | "let" | null;
  featured: boolean;
  title: string;
  sourceTitle: string;
  displayPrice: number;
  location: string;
  city: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  description: string | null;
  propertyType: "land" | "house" | "apartment" | "commercial" | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets?: number | null;
  parkingSpaces?: number | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  yearBuilt?: number | null;
  estateName?: string | null;
  propertyCondition?: "newly_built" | "renovated" | "fairly_used" | "off_plan" | null;
  furnishing?: "unfurnished" | "semi_furnished" | "furnished" | null;
  sizeSqm: string | null;
  rentPeriod: "month" | "year" | null;
  minimumLeaseMonths?: number | null;
  availableFrom?: Date | string | null;
  serviceCharge?: number | string | null;
  securityDeposit?: number | string | null;
  agencyFee?: number | string | null;
  legalFee?: number | string | null;
  cautionFee?: number | string | null;
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
  return listing.purpose === "rent" || listing.purpose === "let" || listing.purpose === "lease" ? `${base}/${listing.rentPeriod === "month" ? "mo" : "yr"}` : base;
}
