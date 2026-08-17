import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ListingCard } from "@/components/ghorizon/ListingCard";
import { SiteFooter, SiteHeader } from "@/components/ghorizon/SiteChrome";
import { type PublicListing } from "@/lib/listingTypes";
import { trpc } from "@/lib/trpc";

export function ListingsPage({ kind }: { kind: "property" | "vehicle" }) {
  const [purpose, setPurpose] = useState<"sale" | "rent" | undefined>();
  const [propertyType, setPropertyType] = useState<"land" | "house" | "apartment" | "commercial" | undefined>();
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const filters = useMemo(() => ({
    kind,
    purpose,
    propertyType: kind === "property" ? propertyType : undefined,
    city: city || undefined,
    query: query || undefined,
    make: kind === "vehicle" ? make || undefined : undefined,
    model: kind === "vehicle" ? model || undefined : undefined,
    minPrice,
    maxPrice,
  }), [kind, purpose, propertyType, city, query, make, model, minPrice, maxPrice]);
  const listingQuery = trpc.listings.publicList.useQuery(filters);
  const listings = (listingQuery.data ?? []) as PublicListing[];
  const title = kind === "property" ? "Find your next address" : "A new road, same trusted name.";
  const eyebrow = kind === "property" ? "Our Portfolio" : "G Horizon Car Sales";
  const intro = kind === "property" ? "A curated database of houses, land plots and commercial properties — each verified, valued and ready to view." : "Curated premium vehicles, full specifications and the seamless inquiry experience you expect from G Horizon.";

  return <div className="min-h-screen"><SiteHeader /><section className="bg-[#0c1f52] px-5 pb-14 pt-20 text-white lg:px-8"><div className="mx-auto max-w-7xl"><p className="eyebrow !text-[#e7d6ac] before:!bg-[#e7d6ac]">{eyebrow}</p><h1 className="mt-5 font-display text-5xl sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-7 text-white/75">{intro}</p></div></section><section className="sticky top-[74px] z-30 border-b border-slate-200 bg-white px-5 py-5 shadow-sm lg:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div className="flex flex-wrap gap-2"><FilterChip label="All" active={!purpose} onClick={() => setPurpose(undefined)} /><FilterChip label="For Sale" active={purpose === "sale"} onClick={() => setPurpose("sale")} /><FilterChip label="For Rent" active={purpose === "rent"} onClick={() => setPurpose("rent")} />{kind === "property" && <><span className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" /><FilterChip label="All types" active={!propertyType} onClick={() => setPropertyType(undefined)} /><FilterChip label="Houses" active={propertyType === "house"} onClick={() => setPropertyType("house")} /><FilterChip label="Land" active={propertyType === "land"} onClick={() => setPropertyType("land")} /><FilterChip label="Commercial" active={propertyType === "commercial"} onClick={() => setPropertyType("commercial")} /></>}</div><div className={kind === "vehicle" ? "grid gap-2 sm:grid-cols-3 xl:grid-cols-6" : "grid gap-2 sm:grid-cols-4"}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={kind === "property" ? "Search location" : "Keyword"} className="min-w-0 border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#3b82f6]" />{kind === "vehicle" && <><input value={make} onChange={(event) => setMake(event.target.value)} placeholder="Make" className="min-w-0 border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#3b82f6]" /><input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Model" className="min-w-0 border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#3b82f6]" /></>}<select value={city} onChange={(event) => setCity(event.target.value)} className="border border-slate-200 px-3 py-2 text-sm"><option value="">All locations</option><option value="Lagos">Lagos</option><option value="Abuja">Abuja</option><option value="Port Harcourt">Port Harcourt</option></select><input type="number" min="0" value={minPrice ?? ""} onChange={(event) => setMinPrice(event.target.value ? Number(event.target.value) : undefined)} placeholder="Min price" className="border border-slate-200 px-3 py-2 text-sm" /><input type="number" min="0" value={maxPrice ?? ""} onChange={(event) => setMaxPrice(event.target.value ? Number(event.target.value) : undefined)} placeholder="Max price" className="border border-slate-200 px-3 py-2 text-sm" /></div></div></div></section><main className="bg-[#f3f4f6] px-5 py-14 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-sm text-slate-500">{listingQuery.isLoading ? "Loading approved listings…" : `${listings.length} approved ${kind === "property" ? "listing" : "vehicle"}${listings.length === 1 ? "" : "s"} available`}</p>{listingQuery.error ? <p className="mt-8 border border-red-200 bg-red-50 p-5 text-sm text-red-700">Unable to load listings: {listingQuery.error.message}</p> : listingQuery.isLoading ? <div className="grid gap-6 pt-8 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[390px] animate-pulse bg-white" />)}</div> : listings.length ? <div className="grid gap-6 pt-8 md:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <div className="mt-8 border border-dashed border-slate-300 bg-white px-6 py-20 text-center"><Search className="mx-auto h-7 w-7 text-[#c9a24b]" /><h2 className="mt-4 font-display text-3xl text-[#0c1f52]">No approved listings match these filters.</h2><p className="mt-3 text-slate-500">Try widening your search, changing a location, or reducing the price range.</p></div>}</div></main><SiteFooter /></div>;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={active ? "rounded-full bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:border-[#3b82f6] hover:text-[#1e3a8a]"}>{label}</button>;
}
