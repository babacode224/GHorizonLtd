import { useRef, useState } from "react";
import { Crosshair, ExternalLink, MapPin, Search } from "lucide-react";
import { MapView } from "@/components/Map";

export type PropertyCoordinate = { lat: number; lng: number };
const LAGOS_CENTER: PropertyCoordinate = { lat: 6.5244, lng: 3.3792 };

function MapEmbed({ coordinate, title }: { coordinate: PropertyCoordinate; title: string }) {
  return <a href={`https://www.google.com/maps?q=${coordinate.lat},${coordinate.lng}`} target="_blank" rel="noreferrer" className="relative grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#dbeafe_0_2px,transparent_3px),linear-gradient(135deg,#eff6ff,#f8fafc_55%,#dbeafe)] bg-[length:24px_24px,auto] text-center"><span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49.5%,#cbd5e1_50%,transparent_50.5%),linear-gradient(transparent_49.5%,#cbd5e1_50%,transparent_50.5%)] bg-[length:72px_72px] opacity-50" /><span className="relative flex max-w-xs flex-col items-center"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#1e3a8a] text-white shadow-lg"><MapPin className="h-5 w-5" /></span><strong className="mt-3 text-sm text-[#0c1f52]">{title}</strong><span className="mt-1 text-xs text-slate-600">{coordinate.lat.toFixed(6)}, {coordinate.lng.toFixed(6)}</span><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1e3a8a] shadow-sm">Open exact location <ExternalLink className="h-3 w-3" /></span></span></a>;
}

export function PropertyMapPicker({ value, onChange }: { value: PropertyCoordinate | null; onChange: (coordinate: PropertyCoordinate) => void }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [query, setQuery] = useState("");
  const [latitude, setLatitude] = useState(value ? String(value.lat) : "");
  const [longitude, setLongitude] = useState(value ? String(value.lng) : "");
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const activeCoordinate = value ?? (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) ? { lat: Number(latitude), lng: Number(longitude) } : LAGOS_CENTER);
  const setLocation = async (coordinate: PropertyCoordinate, recenter = true) => {
    const map = mapRef.current;
    if (!map || !window.google) return;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
    if (!markerRef.current) markerRef.current = new AdvancedMarkerElement({ map, position: coordinate, title: "Selected property location" });
    else markerRef.current.position = coordinate;
    if (recenter) map.panTo(coordinate);
  };
  const commitCoordinates = (nextLatitude: string, nextLongitude: string) => {
    setLatitude(nextLatitude); setLongitude(nextLongitude);
    const coordinate = { lat: Number(nextLatitude), lng: Number(nextLongitude) };
    if (Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng) && coordinate.lat >= -90 && coordinate.lat <= 90 && coordinate.lng >= -180 && coordinate.lng <= 180) { onChange(coordinate); void setLocation(coordinate); }
  };
  const searchMaps = () => { if (query.trim()) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`, "_blank", "noopener,noreferrer"); };

  return <section className="rounded-xl border border-[#cfe0ff] bg-[#f7faff] p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#0c1f52]">Exact map location</p><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Search the address, then click the interactive map to refine the pin. You can also enter latitude and longitude directly for exact precision.</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1e3a8a]"><MapPin className="h-3.5 w-3.5" />{value ? "Pin selected" : "Pin required"}</span></div><div className="mt-4 flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); searchMaps(); } }} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-blue-100" placeholder="Search address, estate or landmark" /><button type="button" onClick={searchMaps} disabled={!query.trim()} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Search className="h-4 w-4" />Search Maps</button></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><label><span className="field-label">Latitude</span><input value={latitude} onChange={(event) => commitCoordinates(event.target.value, longitude)} type="number" step="any" min="-90" max="90" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#3b82f6]" placeholder="e.g. 6.428100" /></label><label><span className="field-label">Longitude</span><input value={longitude} onChange={(event) => commitCoordinates(latitude, event.target.value)} type="number" step="any" min="-180" max="180" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#3b82f6]" placeholder="e.g. 3.421900" /></label></div><div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"><MapView initialCenter={activeCoordinate} initialZoom={value ? 16 : 11} className="h-72" fallback={<div className="h-72"><MapEmbed coordinate={activeCoordinate} title="Property location preview" /></div>} onMapError={() => setMapUnavailable(true)} onMapReady={(map) => { mapRef.current = map; map.addListener("click", (event: google.maps.MapMouseEvent) => { if (event.latLng) commitCoordinates(String(event.latLng.lat()), String(event.latLng.lng())); }); if (value) void setLocation(value, false); }} /></div><div className="mt-3 flex items-center gap-2 text-xs text-slate-600"><Crosshair className="h-3.5 w-3.5 text-[#3b82f6]" /><span>{mapUnavailable ? "Enter the exact latitude and longitude, or open Search Maps to identify them, then save the property pin." : "Click the map to place the pin or enter coordinates directly."}</span></div></section>;
}

export function PropertyLocationMap({ coordinate, title }: { coordinate: PropertyCoordinate; title: string }) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Exact property location</p><p className="mt-1 text-sm font-semibold text-[#0c1f52]">Explore the neighbourhood</p></div><MapPin className="h-5 w-5 text-[#1e3a8a]" /></div><MapView initialCenter={coordinate} initialZoom={16} className="h-80" fallback={<div className="h-80"><MapEmbed coordinate={coordinate} title={`${title} location`} /></div>} onMapReady={async (map) => { const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary; markerRef.current = new AdvancedMarkerElement({ map, position: coordinate, title }); }} /></section>;
}
