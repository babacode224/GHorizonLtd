"use client";
import { useState } from "react";
import { Shield, Home, Car, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import StepIndicator from "@/components/ui/StepIndicator";
import PropertyForm from "@/components/submission/PropertyForm";
import VehicleForm from "@/components/submission/VehicleForm";

type Vertical = "property" | "vehicle" | null;

const STEPS = [
  { label: "Category" },
  { label: "Details" },
  { label: "Submitted" },
];

export default function SubmitPage() {
  const [step,     setStep]     = useState(0);
  const [vertical, setVertical] = useState<Vertical>(null);

  const handleSuccess = () => setStep(2);

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <header className="border-b border-surface-border bg-surface-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="btn-ghost px-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-surface-border" />
          <Shield className="w-4 h-4 text-brand" />
          <span className="text-sm font-semibold text-slate-200">Secure Listing Submission</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">

        {/* Step indicator */}
        <div className="mb-10">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {/* Step 0 — Choose vertical */}
        {step === 0 && (
          <div className="animate-slide-up space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl font-bold text-slate-100">What are you listing?</h1>
              <p className="text-slate-400 text-sm">Select the type of listing you'd like to submit for review.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setVertical("property"); setStep(1); }}
                className="card p-8 text-left hover:border-brand transition-all duration-200 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand/15 flex items-center justify-center mb-4 group-hover:bg-brand/25 transition-colors">
                  <Home className="w-6 h-6 text-brand" />
                </div>
                <h2 className="text-lg font-semibold text-slate-100 mb-1">Real Estate</h2>
                <p className="text-sm text-slate-400">Land, houses, apartments, or commercial properties</p>
              </button>

              <button
                onClick={() => { setVertical("vehicle"); setStep(1); }}
                className="card p-8 text-left hover:border-brand transition-all duration-200 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center mb-4 group-hover:bg-purple-500/25 transition-colors">
                  <Car className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-100 mb-1">Vehicle</h2>
                <p className="text-sm text-slate-400">Cars, trucks, SUVs with clearing documentation</p>
              </button>
            </div>

            {/* Trust notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 mt-8">
              <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300">Platform Verification Notice</p>
                <p className="text-xs text-amber-400/80 mt-0.5">
                  All submissions undergo strict verification by the platform owner before going live.
                  Your listing will remain completely private and invisible to the public until manually
                  reviewed and approved by our team. You will be contacted via your provided details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — The form */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              {vertical === "property" ? (
                <>
                  <div className="w-9 h-9 rounded-lg bg-brand/15 flex items-center justify-center">
                    <Home className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-100">Property Submission</h1>
                    <p className="text-xs text-slate-400">All fields marked * are required</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <Car className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-100">Vehicle Submission</h1>
                    <p className="text-xs text-slate-400">All fields marked * are required</p>
                  </div>
                </>
              )}
              <button
                onClick={() => setStep(0)}
                className="btn-ghost ml-auto text-xs"
              >
                Change category
              </button>
            </div>

            <div className="card p-6">
              {vertical === "property" ? (
                <PropertyForm onSuccess={handleSuccess} />
              ) : (
                <VehicleForm onSuccess={handleSuccess} />
              )}
            </div>

            {/* Reminder notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-card border border-surface-border">
              <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">
                <span className="text-slate-400 font-medium">Submissions undergo strict verification by the platform owner before going live.</span>{" "}
                Documents you upload are stored securely and only visible to our admin team.
              </p>
            </div>
          </div>
        )}

        {/* Step 2 — Success */}
        {step === 2 && (
          <div className="animate-slide-up text-center py-16 space-y-6">
            <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">Submission Received!</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Your listing has been submitted and is now <strong className="text-amber-400">Pending Review</strong>.
                Our platform owner will verify your documents and contact you shortly.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border max-w-sm mx-auto text-left space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">What happens next</p>
              {["Our team reviews your documents", "Admin may contact you for clarification", "If approved, your listing goes live publicly", "You'll be notified via your provided contact details"].map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand/20 text-brand text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                  <p className="text-xs text-slate-400">{s}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setStep(0); setVertical(null); }} className="btn-ghost">
                Submit Another
              </button>
              <Link href="/" className="btn-primary">Back to Home</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
