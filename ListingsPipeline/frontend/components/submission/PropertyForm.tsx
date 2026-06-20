"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FileDropzone from "@/components/ui/FileDropzone";
import { submitProperty } from "@/lib/api";
import { Youtube, MapPin, DollarSign, Home } from "lucide-react";

const PROPERTY_TYPES = ["Land", "House", "Apartment", "Commercial"];
const TITLE_TYPES = ["C of O", "Gazette", "Survey Plan", "Deed of Assignment", "Governor Consent"];

interface FormValues {
  owner_name:  string;
  owner_phone: string;
  owner_email: string;
  type:        string;
  title:       string;
  description: string;
  price:       number;
  location:    string;
  landmarks:   string;
  size_sqm:    number;
  title_type:  string;
  youtube_url: string;
}

export default function PropertyForm({ onSuccess }: { onSuccess: () => void }) {
  const [documents, setDocuments] = useState<File[]>([]);
  const [images,    setImages]    = useState<File[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v && fd.append(k, String(v)));
      documents.forEach((f) => fd.append("documents", f));
      images.forEach((f)    => fd.append("images", f));
      await submitProperty(fd);
      onSuccess();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-slide-up">

      {/* Owner Contact */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-surface-border pb-2">
          Owner Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" placeholder="John Adebayo" {...register("owner_name", { required: "Name is required" })} />
            {errors.owner_name && <p className="mt-1 text-xs text-danger">{errors.owner_name.message}</p>}
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input className="input" type="tel" placeholder="+234 800 000 0000" {...register("owner_phone", { required: "Phone is required" })} />
            {errors.owner_phone && <p className="mt-1 text-xs text-danger">{errors.owner_phone.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="owner@email.com" {...register("owner_email")} />
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-surface-border pb-2">
          Property Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Property Type *</label>
            <select className="input" {...register("type", { required: true })}>
              <option value="">Select type…</option>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Title / Document Type *</label>
            <select className="input" {...register("title_type", { required: true })}>
              <option value="">Select title…</option>
              {TITLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Listing Title *</label>
            <input className="input" placeholder="4-Bedroom Detached Duplex in Lekki Phase 1" {...register("title", { required: "Title is required" })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Describe the property in detail…" {...register("description")} />
          </div>
          <div>
            <label className="label">
              <DollarSign className="inline w-3 h-3 mr-1" />
              Asking Price (₦) *
            </label>
            <input className="input" type="number" min={0} placeholder="45000000" {...register("price", { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">Size (sqm)</label>
            <input className="input" type="number" min={0} placeholder="450" {...register("size_sqm", { valueAsNumber: true })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">
              <MapPin className="inline w-3 h-3 mr-1" />
              Location / Address *
            </label>
            <input className="input" placeholder="Lekki Phase 1, Lagos" {...register("location", { required: true })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Nearby Landmarks</label>
            <input className="input" placeholder="e.g. 5 mins from Shoprite, beside Chevron HQ" {...register("landmarks")} />
          </div>
        </div>
      </section>

      {/* YouTube Video */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-surface-border pb-2">
          Video Tour (Optional)
        </h3>
        <div>
          <label className="label">
            <Youtube className="inline w-3 h-3 mr-1 text-red-400" />
            YouTube Video URL
          </label>
          <input
            className="input"
            placeholder="https://www.youtube.com/watch?v=..."
            {...register("youtube_url", {
              pattern: {
                value: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
                message: "Please enter a valid YouTube URL",
              },
            })}
          />
          {errors.youtube_url && <p className="mt-1 text-xs text-danger">{errors.youtube_url.message}</p>}
        </div>
      </section>

      {/* Documents */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-surface-border pb-2">
          Legal Documents & Photos
        </h3>
        <FileDropzone
          label="Legal Documents (C of O, Survey Plans, Deeds)"
          hint="Upload scans of all ownership documents for verification"
          files={documents}
          onChange={setDocuments}
          accept={{ "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
        />
        <FileDropzone
          label="Property Photos"
          hint="Upload clear exterior and interior photographs"
          files={images}
          onChange={setImages}
          accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        />
      </section>

      {error && (
        <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit for Review"
          )}
        </button>
      </div>
    </form>
  );
}
