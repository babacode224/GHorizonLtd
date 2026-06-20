import Link from "next/link";
import { Shield, Home, Car, ArrowRight, CheckCircle, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <header className="border-b border-surface-border bg-surface-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand" />
            <span className="font-bold text-slate-100">ListingsPipeline</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="btn-ghost text-xs">
              <Lock className="w-3.5 h-3.5" />
              Admin
            </Link>
            <Link href="/submit" className="btn-primary text-xs py-2">
              Submit Listing
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Admin-Verified Listings Only
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 leading-tight">
            Real Estate & Vehicles
            <br />
            <span className="text-brand">You Can Trust</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Every listing on this platform is manually reviewed and verified by our team before going public. No unverified listings, ever.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/submit" className="btn-primary py-3 px-8">
              Submit Your Listing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 pb-16 grid sm:grid-cols-2 gap-6">
        <div className="card p-8 space-y-4 hover:border-brand/50 transition-colors duration-200">
          <div className="w-12 h-12 rounded-xl bg-brand/15 flex items-center justify-center">
            <Home className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Real Estate</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Land, houses, apartments, and commercial properties — each with verified title documents (C of O, Survey Plans, and more).
          </p>
          <ul className="space-y-2 text-xs text-slate-400">
            {["Verified title documents", "C of O / Survey Plan confirmed", "Owner contact details vetted", "Admin-curated descriptions"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-8 space-y-4 hover:border-purple-500/50 transition-colors duration-200">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Car className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Vehicles</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Cars and trucks with customs clearing papers, condition scores, and full documentation reviewed by our admin team.
          </p>
          <ul className="space-y-2 text-xs text-slate-400">
            {["Clearing papers verified", "Condition score reviewed", "VIN documented", "Admin-approved pricing"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-surface-border py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-10">How the Pipeline Works</h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-surface-border hidden sm:block" />
            <div className="space-y-8">
              {[
                { step: 1, title: "Owner Submits", body: "Sellers fill out a secure form and upload their documents privately. The listing is immediately locked to Pending Review — invisible to the public.", color: "bg-brand/15 text-brand" },
                { step: 2, title: "Admin Reviews", body: "Our platform owner inspects all uploaded documents, rewrites copy if needed, and adjusts pricing metadata through the internal Verification Dashboard.", color: "bg-amber-500/15 text-amber-400" },
                { step: 3, title: "Published or Rejected", body: "With one click the admin publishes the listing live, or rejects it with a detailed reason. Only then does it become visible on the platform.", color: "bg-success/15 text-success" },
              ].map(({ step, title, body, color }) => (
                <div key={step} className="flex gap-5 sm:pl-14 relative">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 font-bold text-sm sm:absolute sm:left-1`}>
                    {step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-200">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-border py-8 px-4 text-center">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} ListingsPipeline. All listings are admin-verified before publication.
        </p>
      </footer>
    </div>
  );
}
