"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FileDropzone from "@/components/ui/FileDropzone";
import { submitVehicle } from "@/lib/api";
import { Car, Youtube } from "lucide-react";

const CONDITIONS = ["Brand New", "Foreign Used", "Locally Used"];
const CONDITION_HINT: Record<string, string> = {
  "Brand New":    "Never registered",
  "Foreign Used": "Previously used abroad",
  "Locally Used": "Used within the country",
};

interface FormValues {
  owner_name:      string;
  owner_phone:     string;
  owner_email:     string;
  make:            string;
  model:           string;
  year:            number;
  trim:            string;
  color:           string;
  vin:             string;
  mileage_km:      number;
  condition:       string;
  condition_score: number;
  price:           number;
  description:     string;
  location:        string;
  youtube_url:     string;
}

export default function VehicleForm({ onSuccess }: { onSuccess: () => void }) {
  const [clearingPaper, setClearingPaper] = useState<File[]>([]);
  const [documents,     setDocuments]     = useState<File[]>([]);
  const [images,        setImages]        = useState<File[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const selectedCondition = watch("condition");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v != null && v !== "" && fd.append(k, String(v)));
      if (clearingPaper[0]) fd.append("clearing_papers", clearingPaper[0]);
      documents.forEach((f) => fd.append("documents", f));
      images.forEach((f)    => fd.append("images", f));
      await submitVehicle(fd);
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
            <input className="input" placeholder="Chukwuemeka Obi" {...register("owner_name", { required: "Name is required" })} />
            {errors.owner_name && <p className="mt-1 text-xs text-danger">{errors.owner_name.message}</p>}
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input className="input" type="tel" placeholder="+234 800 000 0000" {...register("owner_phone", { required: "Phone is required" })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="owner@email.com" {...register("owner_email")} />
          </div>
        </div>
      </section>

      {/* Vehicle Details */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-surface-border pb-2">
          <Car className="inline w-4 h-4 mr-2" />
          Vehicle Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Make *</label>
            <input className="input" placeholder="Toyota" {...register("make", { required: true })} />
          </div>
          <div>
            <label className="label">Model *</label>
            <input className="input" placeholder="Camry" {...register("model", { required: true })} />
          </div>
          <div>
            <label className="label">Year *</label>
            <input className="input" type="number" min={1900} max={2100} placeholder="2022" {...register("year", { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">Trim / Variant</label>
            <input className="input" placeholder="XSE V6" {...register("trim")} />
          </div>
          <div>
            <label className="label">Color</label>
            <input className="input" placeholder="Midnight Black" {...register("color")} />
          </div>
          <div>
            <label className="label">Mileage (km)</label>
            <input className="input" type="number" min={0} placeholder="32000" {...register("mileage_km", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">VIN (optional)</label>
            <input className="input" placeholder="1HGBH41JXMN109186" maxLength={17} {...register("vin")} />
          </div>
          <div>
            <label className="label">Asking Price (₦) *</label>
            <input className="input" type="number" min={0} placeholder="12500000" {...register("price", { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">Location *</label>
            <input className="input" placeholder="Abuja, FCT" {...register("location", { required: true })} />
          </div>
        </div>

        {/* Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Condition *</label>
            <div className="flex gap-3 flex-wrap">
              {CONDITIONS.map((c) => (
                <label
                  key={c}
                  className={`flex-1 min-w-[120px] cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-colors duration-150 ${
                    selectedCondition === c
                      ? "border-brand bg-brand/15 text-brand"
                      : "border-surface-border text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <input type="radio" className="sr-only" value={c} {...register("condition", { required: true })} />
                  <span>{c}</span>
                  <p className="text-xs font-normal text-slate-500 mt-0.5">{CONDITION_HINT[c]}</p>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Condition Score (1–10)</label>
            <input className="input" type="number" min={1} max={10} placeholder="8" {...register("condition_score", { valueAsNumber: true, min: 1, max: 10 })} />
            <p className="mt-1 text-xs text-slate-500">Your honest rating of overall vehicle condition</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[100px] resize-none" placeholder="Full service history, accident-free, single-owner…" {...register("description")} />
        </div>
      </section>

      {/* YouTube */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-surface-border pb-2">
          Video (Optional)
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
          Documents & Photos
        </h3>
        <FileDropzone
          label="Customs Clearing Papers *"
          hint="Upload the official customs clearing certificate"
          multiple={false}
          maxFiles={1}
          files={clearingPaper}
          onChange={setClearingPaper}
          accept={{ "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
        />
        <FileDropzone
          label="Other Documents (proof of ownership, CMR, etc.)"
          files={documents}
          onChange={setDocuments}
          accept={{ "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
        />
        <FileDropzone
          label="Vehicle Photos"
          hint="Front, rear, sides, interior, odometer reading"
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
