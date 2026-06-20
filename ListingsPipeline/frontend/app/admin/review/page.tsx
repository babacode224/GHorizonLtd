"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut, Home, Car, LayoutDashboard } from "lucide-react";
import SubmissionQueue from "@/components/admin/SubmissionQueue";
import VerificationPanel from "@/components/admin/VerificationPanel";
import Link from "next/link";

export default function AdminReviewPage() {
  const router = useRouter();
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"property" | "vehicle" | null>(null);
  const [refreshKey,   setRefreshKey]   = useState(0);

  // Guard: redirect to login if no token
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("admin_token")) {
      router.push("/admin");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  };

  const handleSelect = (id: string, type: "property" | "vehicle") => {
    setSelectedId(id);
    setSelectedType(type);
  };

  const handleActionComplete = () => {
    setSelectedId(null);
    setSelectedType(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top nav */}
      <header className="shrink-0 border-b border-surface-border bg-surface-card z-10">
        <div className="flex items-center h-14 px-4 gap-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-brand" />
            <span className="font-semibold text-slate-200 text-sm">ListingsPipeline</span>
            <span className="text-slate-600 text-sm">/</span>
            <span className="text-slate-400 text-sm">Verification Dashboard</span>
          </div>

          <div className="flex items-center gap-1 ml-6">
            <Link href="/" className="btn-ghost text-xs">
              <Home className="w-3.5 h-3.5" />
              Public Site
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">Admin</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost text-xs">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — queue */}
        <aside className="w-72 xl:w-80 shrink-0 border-r border-surface-border bg-surface-card flex flex-col overflow-hidden">
          <SubmissionQueue
            key={refreshKey}
            selectedId={selectedId}
            selectedType={selectedType}
            onSelect={handleSelect}
          />
        </aside>

        {/* Main — verification panel */}
        <main className="flex-1 overflow-hidden">
          {selectedId && selectedType ? (
            <VerificationPanel
              key={`${selectedType}-${selectedId}`}
              id={selectedId}
              type={selectedType}
              onActionComplete={handleActionComplete}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center">
        <LayoutDashboard className="w-7 h-7 text-slate-600" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-400">Select a submission</h3>
        <p className="text-sm text-slate-600 max-w-xs">
          Choose a pending submission from the queue on the left to review, edit, and publish or reject it.
        </p>
      </div>
      <div className="flex gap-6 mt-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-brand" />
          Real Estate
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-3.5 h-3.5 text-purple-400" />
          Vehicles
        </div>
      </div>
    </div>
  );
}
