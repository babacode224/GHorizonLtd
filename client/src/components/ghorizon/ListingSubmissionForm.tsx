import { CheckCircle2, ChevronRight, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { trpc } from "@/lib/trpc";
import { PropertyMapPicker, type PropertyCoordinate } from "@/components/ghorizon/PropertyMapPicker";

type Kind = "property" | "vehicle";
type Upload = {
  fileName: string;
  contentType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
  base64: string;
};

function fileToUpload(file: File): Promise<Upload> {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error(`${file.name} is larger than 10 MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const contentType = file.type as Upload["contentType"];
      const supported = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!supported.includes(contentType)) {
        reject(new Error(`${file.name} has an unsupported file type.`));
        return;
      }
      resolve({
        fileName: file.name,
        contentType,
        base64: String(reader.result).split(",")[1] ?? "",
      });
    };
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export function ListingSubmissionForm({ adminMode = false, propertyOnly = false, onPublished }: { adminMode?: boolean; propertyOnly?: boolean; onPublished?: () => void }) {
  const [kind, setKind] = useState<Kind | null>(propertyOnly ? "property" : null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = trpc.listings.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (cause) => setError(cause.message),
  });
  const adminSubmit = trpc.admin.directCreate.useMutation({
    onSuccess: () => { setSubmitted(true); onPublished?.(); },
    onError: (cause) => setError(cause.message),
  });

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <p className="mt-5 font-display text-4xl text-[#0c1f52]">Submission received.</p>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
          {adminMode ? "This listing has been published directly by an administrator." : <>Your listing is securely stored as <strong>Pending Review</strong>. It remains private until a G Horizon administrator verifies and approves it.</>}
        </p>
          <button onClick={() => { setKind(propertyOnly ? "property" : null); setSubmitted(false); }} className="mt-7 bg-[#1e3a8a] px-5 py-3 text-sm font-semibold text-white">
          Submit another listing
        </button>
      </div>
    );
  }

  if (!kind) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <span className="eyebrow">{adminMode ? "Administrator publish" : "Secure Listing Submission"}</span>
          <h1 className="mt-4 font-display text-5xl text-[#0c1f52]">What would you like to list?</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">{adminMode ? "Choose the inventory type you want to publish directly to the public G Horizon site." : "Every listing enters a private verification queue. Only approved records can appear on the public G Horizon site."}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <ChoiceCard title="Real Estate" text="Land, houses, apartments, and commercial property with title evidence." onClick={() => setKind("property")} />
          <ChoiceCard title="Vehicle" text="Premium vehicles with photos, clearance evidence, and condition details." onClick={() => setKind("vehicle")} />
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500"><ShieldCheck className="h-4 w-4 text-[#c9a24b]" />Your information and documents are visible only to the G Horizon review team.</p>
      </div>
    );
  }

  return <ListingForm kind={kind} submitting={submit.isPending || adminSubmit.isPending} adminMode={adminMode} error={error} onBack={() => setKind(propertyOnly ? "property" : null)} onSubmit={(payload, featured) => { setError(null); if (adminMode) adminSubmit.mutate({ listing: payload as never, featured }); else submit.mutate(payload as never); }} />;
}

function ChoiceCard({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return <button onClick={onClick} className="group border border-slate-200 bg-white p-8 text-left transition hover:-translate-y-1 hover:border-[#3b82f6] hover:shadow-xl"><p className="font-display text-3xl text-[#0c1f52]">{title}</p><p className="mt-3 leading-7 text-slate-500">{text}</p><span className="mt-6 inline-flex items-center gap-2 font-semibold text-[#1e3a8a]">Choose {title.toLowerCase()} <ChevronRight className="h-4 w-4" /></span></button>;
}

function ListingForm({ kind, submitting, adminMode, error, onBack, onSubmit }: { kind: Kind; submitting: boolean; adminMode: boolean; error: string | null; onBack: () => void; onSubmit: (value: unknown, featured: boolean) => void }) {
  const [images, setImages] = useState<Upload[]>([]);
  const [documents, setDocuments] = useState<Upload[]>([]);
  const [clearingPaper, setClearingPaper] = useState<Upload | undefined>();
  const [coordinate, setCoordinate] = useState<PropertyCoordinate | null>(null);
  const [mapMissing, setMapMissing] = useState(false);
  const field = "w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-blue-100";
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500";

  async function addFiles(files: FileList | null, target: "images" | "documents" | "clearing") {
    if (!files) return;
    try {
      const parsed = await Promise.all(Array.from(files).map(fileToUpload));
      if (target === "images") setImages((value) => [...value, ...parsed].slice(0, 10));
      if (target === "documents") setDocuments((value) => [...value, ...parsed].slice(0, 10));
      if (target === "clearing") setClearingPaper(parsed[0]);
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "Upload preparation failed.");
    }
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (adminMode && kind === "property" && !coordinate) { setMapMissing(true); return; }
    const data = new FormData(event.currentTarget);
    const base = {
      kind,
      ownerName: String(data.get("ownerName") ?? ""),
      ownerPhone: String(data.get("ownerPhone") ?? ""),
      ownerEmail: String(data.get("ownerEmail") ?? ""),
      sourceTitle: String(data.get("sourceTitle") ?? ""),
      description: String(data.get("description") ?? ""),
      price: Number(data.get("price")),
      location: String(data.get("location") ?? ""),
      city: String(data.get("city") ?? ""),
      purpose: String(data.get("purpose") ?? "sale"),
      youtubeUrl: String(data.get("youtubeUrl") ?? ""),
      images,
      documents,
    };
    const propertyPayload = {
      ...base,
      kind: "property" as const,
      propertyType: String(data.get("propertyType")),
      propertyTitleType: String(data.get("propertyTitleType")),
      landmarks: String(data.get("landmarks") ?? ""),
      estateName: String(data.get("estateName") ?? ""),
      latitude: coordinate?.lat,
      longitude: coordinate?.lng,
      propertyCondition: String(data.get("propertyCondition") ?? "") || undefined,
      furnishing: String(data.get("furnishing") ?? "") || undefined,
      sizeSqm: data.get("sizeSqm") ? Number(data.get("sizeSqm")) : undefined,
      bedrooms: data.get("bedrooms") ? Number(data.get("bedrooms")) : undefined,
      bathrooms: data.get("bathrooms") ? Number(data.get("bathrooms")) : undefined,
      toilets: data.get("toilets") ? Number(data.get("toilets")) : undefined,
      parkingSpaces: data.get("parkingSpaces") ? Number(data.get("parkingSpaces")) : undefined,
      floorNumber: data.get("floorNumber") ? Number(data.get("floorNumber")) : undefined,
      totalFloors: data.get("totalFloors") ? Number(data.get("totalFloors")) : undefined,
      yearBuilt: data.get("yearBuilt") ? Number(data.get("yearBuilt")) : undefined,
      rentPeriod: data.get("rentPeriod") || undefined,
      minimumLeaseMonths: data.get("minimumLeaseMonths") ? Number(data.get("minimumLeaseMonths")) : undefined,
      availableFrom: data.get("availableFrom") ? new Date(String(data.get("availableFrom"))) : undefined,
      serviceCharge: data.get("serviceCharge") ? Number(data.get("serviceCharge")) : undefined,
      securityDeposit: data.get("securityDeposit") ? Number(data.get("securityDeposit")) : undefined,
      agencyFee: data.get("agencyFee") ? Number(data.get("agencyFee")) : undefined,
      legalFee: data.get("legalFee") ? Number(data.get("legalFee")) : undefined,
      cautionFee: data.get("cautionFee") ? Number(data.get("cautionFee")) : undefined,
      features: String(data.get("features") ?? "").split("\n").map((value) => value.trim()).filter(Boolean),
    };
    const vehiclePayload = {
      ...base,
      kind: "vehicle" as const,
      make: String(data.get("make") ?? ""),
      model: String(data.get("model") ?? ""),
      vehicleYear: Number(data.get("vehicleYear")),
      trim: String(data.get("trim") ?? ""),
      color: String(data.get("color") ?? ""),
      vin: String(data.get("vin") ?? ""),
      vehicleCondition: String(data.get("vehicleCondition")),
      mileageKm: data.get("mileageKm") ? Number(data.get("mileageKm")) : undefined,
      conditionScore: data.get("conditionScore") ? Number(data.get("conditionScore")) : undefined,
      clearingPaper,
    };
    onSubmit(kind === "property" ? propertyPayload : vehiclePayload, data.get("featured") === "on");
  }

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div><span className="eyebrow">Step 2 of 2</span><h1 className="mt-2 font-display text-4xl text-[#0c1f52]">{kind === "property" ? "Real estate details" : "Vehicle details"}</h1></div>
        <button type="button" onClick={onBack} className="text-sm font-semibold text-[#1e3a8a]">Change category</button>
      </div>
      <div className="border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <section>
          <p className="font-display text-2xl text-[#0c1f52]">Owner contact</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="Full name" name="ownerName" required className={field} labelClass={labelClass} />
            <Field label="Phone" name="ownerPhone" required className={field} labelClass={labelClass} />
            <Field label="Email" type="email" name="ownerEmail" className={field} labelClass={labelClass} />
          </div>
        </section>
        <section className="mt-10 border-t border-slate-100 pt-8">
          <p className="font-display text-2xl text-[#0c1f52]">{kind === "property" ? "Listing" : "Vehicle"} information</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={kind === "property" ? "Listing title" : "Vehicle title"} name="sourceTitle" required className={field} labelClass={labelClass} />
            <Field label="Price (₦)" type="number" name="price" min="0" required className={field} labelClass={labelClass} />
            <Field label="Location" name="location" required className={field} labelClass={labelClass} />
            <Field label="City" name="city" className={field} labelClass={labelClass} />
            <Select label="Listing purpose" name="purpose" className={field} labelClass={labelClass} options={[["sale", "For Sale"], ["rent", "For Rent"], ["let", "To Let"], ["lease", "For Lease"]]} />
            {kind === "property" ? <PropertyFields field={field} labelClass={labelClass} /> : <VehicleFields field={field} labelClass={labelClass} />}
          </div>
          {adminMode && kind === "property" && <div className="mt-6"><PropertyMapPicker value={coordinate} onChange={(nextCoordinate) => { setCoordinate(nextCoordinate); setMapMissing(false); }} />{mapMissing && <p className="mt-2 text-sm font-semibold text-red-700">Select an exact map location before publishing this property.</p>}</div>}
          <div className="mt-4"><label className={labelClass}>Description</label><textarea name="description" rows={5} className={field} placeholder="Share the important details of this listing." /></div>
          {kind === "property" && <div className="mt-4"><label className={labelClass}>Features & amenities (one per line)</label><textarea name="features" rows={5} className={field} placeholder={"24/7 security\nFitted kitchen\nBackup power\nSwimming pool\nWater treatment plant"} /></div>}
          <div className="mt-4"><Field label="YouTube video tour URL" name="youtubeUrl" type="url" className={field} labelClass={labelClass} /><p className="mt-1 text-xs text-slate-500">Paste the public YouTube URL. The video will be shown above the photo gallery on the public property page.</p></div>
        </section>
        <section className="mt-10 border-t border-slate-100 pt-8">
          <p className="font-display text-2xl text-[#0c1f52]">Evidence & photographs</p>
          <p className="mt-2 text-sm text-slate-500">Upload up to 10 professional JPG, PNG or WEBP images. Photos appear below the YouTube tour when a public video URL is provided. Supporting PDF documents remain private.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <UploadBlock label="Listing photos" multiple accept="image/jpeg,image/png,image/webp" names={images.map((file) => file.fileName)} onFiles={(files) => addFiles(files, "images")} />
            <UploadBlock label="Supporting documents" multiple accept="application/pdf,image/jpeg,image/png,image/webp" names={documents.map((file) => file.fileName)} onFiles={(files) => addFiles(files, "documents")} />
            {kind === "vehicle" && <UploadBlock label="Clearing papers" accept="application/pdf,image/jpeg,image/png" names={clearingPaper ? [clearingPaper.fileName] : []} onFiles={(files) => addFiles(files, "clearing")} />}
          </div>
        </section>
        {error && <p className="mt-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-9 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <span className="flex max-w-sm items-center gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0 text-[#c9a24b]" />{adminMode ? "This direct property-manager workspace publishes listings immediately. Check every detail before publishing." : "Public submissions always remain Pending Review until verified by an administrator."}</span>
          {adminMode && <label className="mr-auto flex items-center gap-2 text-xs font-bold text-[#1e3a8a]"><input name="featured" type="checkbox" className="accent-[#1e3a8a]" />Feature on homepage</label>}
          <button disabled={submitting} className="inline-flex shrink-0 items-center gap-2 bg-[#1e3a8a] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? "Publishing…" : adminMode ? "Publish Listing" : "Submit for Review"}</button>
        </div>
      </div>
    </form>
  );
}

function PropertyFields({ field, labelClass }: { field: string; labelClass: string }) {
  return <><Select label="Property type" name="propertyType" className={field} labelClass={labelClass} options={[["house", "House"], ["land", "Land Plot"], ["apartment", "Apartment"], ["commercial", "Commercial"]]} /><Select label="Title type" name="propertyTitleType" className={field} labelClass={labelClass} options={[["certificate_of_occupancy", "C of O"], ["gazette", "Gazette"], ["survey_plan", "Survey Plan"], ["deed_of_assignment", "Deed of Assignment"], ["governors_consent", "Governor's Consent"]]} /><Field label="Estate / development" name="estateName" className={field} labelClass={labelClass} /><Field label="Landmarks" name="landmarks" className={field} labelClass={labelClass} /><Select label="Property condition" name="propertyCondition" className={field} labelClass={labelClass} options={[["", "Not specified"], ["newly_built", "Newly built"], ["renovated", "Renovated"], ["fairly_used", "Fairly used"], ["off_plan", "Off-plan"]]} /><Select label="Furnishing" name="furnishing" className={field} labelClass={labelClass} options={[["", "Not specified"], ["unfurnished", "Unfurnished"], ["semi_furnished", "Semi-furnished"], ["furnished", "Furnished"]]} /><Field label="Size (m²)" type="number" name="sizeSqm" min="0" className={field} labelClass={labelClass} /><Field label="Year built" type="number" name="yearBuilt" min="1800" max="2100" className={field} labelClass={labelClass} /><Field label="Bedrooms" type="number" name="bedrooms" min="0" className={field} labelClass={labelClass} /><Field label="Bathrooms" type="number" name="bathrooms" min="0" className={field} labelClass={labelClass} /><Field label="Toilets" type="number" name="toilets" min="0" className={field} labelClass={labelClass} /><Field label="Parking spaces" type="number" name="parkingSpaces" min="0" className={field} labelClass={labelClass} /><Field label="Floor number" type="number" name="floorNumber" min="0" className={field} labelClass={labelClass} /><Field label="Total floors" type="number" name="totalFloors" min="0" className={field} labelClass={labelClass} /><Select label="Payment period" name="rentPeriod" className={field} labelClass={labelClass} options={[["", "Not applicable"], ["year", "Per year"], ["month", "Per month"]]} /><Field label="Minimum lease (months)" type="number" name="minimumLeaseMonths" min="1" className={field} labelClass={labelClass} /><Field label="Available from" type="date" name="availableFrom" className={field} labelClass={labelClass} /><Field label="Service charge (₦)" type="number" name="serviceCharge" min="0" className={field} labelClass={labelClass} /><Field label="Security deposit (₦)" type="number" name="securityDeposit" min="0" className={field} labelClass={labelClass} /><Field label="Agency fee (₦)" type="number" name="agencyFee" min="0" className={field} labelClass={labelClass} /><Field label="Legal fee (₦)" type="number" name="legalFee" min="0" className={field} labelClass={labelClass} /><Field label="Caution fee (₦)" type="number" name="cautionFee" min="0" className={field} labelClass={labelClass} /></>;
}

function VehicleFields({ field, labelClass }: { field: string; labelClass: string }) {
  return <><Field label="Make" name="make" required className={field} labelClass={labelClass} /><Field label="Model" name="model" required className={field} labelClass={labelClass} /><Field label="Year" type="number" name="vehicleYear" min="1900" max="2100" required className={field} labelClass={labelClass} /><Select label="Condition" name="vehicleCondition" className={field} labelClass={labelClass} options={[["brand_new", "Brand New"], ["foreign_used", "Foreign Used"], ["locally_used", "Locally Used"]]} /><Field label="Trim" name="trim" className={field} labelClass={labelClass} /><Field label="Color" name="color" className={field} labelClass={labelClass} /><Field label="VIN" name="vin" maxLength={17} className={field} labelClass={labelClass} /><Field label="Mileage (km)" type="number" name="mileageKm" min="0" className={field} labelClass={labelClass} /><Field label="Condition score (1–10)" type="number" name="conditionScore" min="1" max="10" className={field} labelClass={labelClass} /></>;
}

function Field({ label, labelClass, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; labelClass: string; className: string }) {
  return <label><span className={labelClass}>{label}{props.required && " *"}</span><input {...props} className={className} /></label>;
}

function Select({ label, labelClass, className, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; labelClass: string; className: string; options: [string, string][] }) {
  return <label><span className={labelClass}>{label}</span><select {...props} className={className}>{options.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label>;
}

function UploadBlock({ label, names, onFiles, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & { label: string; names: string[]; onFiles: (files: FileList | null) => void }) {
  return <label className="block border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-[#3b82f6]"><FileUp className="mx-auto h-5 w-5 text-[#3b82f6]" /><span className="mt-2 block text-sm font-semibold text-[#0c1f52]">{label}</span><span className="mt-1 block text-xs text-slate-500">Click to select files</span><input {...props} type="file" className="sr-only" onChange={(event) => onFiles(event.target.files)} />{names.length > 0 && <span className="mt-3 block text-xs text-emerald-700">{names.join(", ")}</span>}</label>;
}
