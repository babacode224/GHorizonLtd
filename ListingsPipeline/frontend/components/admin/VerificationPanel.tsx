"use client";
import { useState, useEffect } from "react";
import {
  fetchPropertyDetail, fetchVehicleDetail,
  publishProperty, publishVehicle,
  rejectProperty, rejectVehicle,
} from "@/lib/api";
import {
  Phone, Mail, MapPin, FileText, Image as ImageIcon, ExternalLink,
  CheckCircle2, XCircle, Youtube, Star, Home, Car, Tag, AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

interface Props {
  id: string;
  type: "property" | "vehicle";
  onActionComplete: () => void;
}

type Listing = Record<string, any>;

export default function VerificationPanel({ id, type, onActionComplete }: Props) {
  const [listing,        setListing]        = useState<Listing | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [publishing,     setPublishing]     = useState(false);
  const [rejecting,      setRejecting]      = useState(false);
  const [rejectModal,    setRejectModal]    = useState(false);
  const [rejectReason,   setRejectReason]   = useState("");
  const [successMsg,     setSuccessMsg]     = useState<string | null>(null);
  const [errorMsg,       setErrorMsg]       = useState<string | null>(null);

  // Admin editable fields
  const [adminTitle,       setAdminTitle]       = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const [adminPrice,       setAdminPrice]       = useState("");
  const [adminNotes,       setAdminNotes]       = useState("");

  const [activeDocTab, setActiveDocTab] = useState<"docs" | "images">("docs");

  useEffect(() => {
    setListing(null);
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const fetch = type === "property" ? fetchPropertyDetail : fetchVehicleDetail;
    fetch(id).then((res) => {
      const data = res.data;
      setListing(data);
      setAdminTitle(data.admin_title || "");
      setAdminDescription(data.admin_description || "");
      setAdminPrice(data.admin_price ? String(data.admin_price) : "");
      setAdminNotes(data.admin_notes || "");
    }).finally(() => setLoading(false));
  }, [id, type]);

  const handlePublish = async () => {
    setPublishing(true);
    setErrorMsg(null);
    try {
      const body: Record<string, unknown> = {};
      if (adminTitle)       body.admin_title       = adminTitle;
      if (adminDescription) body.admin_description = adminDescription;
      if (adminPrice)       body.admin_price       = parseFloat(adminPrice);
      if (adminNotes)       body.admin_notes       = adminNotes;

      if (type === "property") await publishProperty(id, body);
      else                     await publishVehicle(id, body);

      setSuccessMsg("Listing published successfully!");
      setTimeout(onActionComplete, 1500);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || "Publish failed.");
    } finally {
      setPublishing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setRejecting(true);
    setErrorMsg(null);
    try {
      if (type === "property") await rejectProperty(id, rejectReason);
      else                     await rejectVehicle(id, rejectReason);
      setRejectModal(false);
      setSuccessMsg("Submission rejected.");
      setTimeout(onActionComplete, 1200);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || "Reject failed.");
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-4 p-6 animate-pulse">
        <div className="h-8 bg-surface-raised rounded-lg w-2/3" />
        <div className="h-4 bg-surface-raised rounded w-1/3" />
        <div className="flex-1 bg-surface-raised rounded-xl mt-4" />
        <div className="h-14 bg-surface-raised rounded-xl" />
      </div>
    );
  }

  if (!listing) return null;

  const displayTitle = type === "property"
    ? (listing.title || "Untitled")
    : `${listing.year} ${listing.make} ${listing.model}${listing.trim ? " " + listing.trim : ""}`;

  return (
    <div className="flex flex-col h-full">
      {/* ── Panel body (scrollable) ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 h-full">

          {/* LEFT — Owner Info + Documents + Video */}
          <div className="border-r border-surface-border overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  type === "property" ? "bg-brand/15" : "bg-purple-500/15"
                )}>
                  {type === "property"
                    ? <Home className="w-5 h-5 text-brand" />
                    : <Car  className="w-5 h-5 text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-100 leading-tight">{displayTitle}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="status-pending">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Pending Review
                    </span>
                    <span className="text-xs text-slate-500">#{id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Owner contact */}
              <div className="card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner Details</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-surface-raised flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm font-medium text-slate-200">{listing.owner_phone}</p>
                    </div>
                  </div>
                  {listing.owner_email && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-surface-raised flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-200">{listing.owner_email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-surface-raised flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="text-sm font-medium text-slate-200">{listing.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing-specific metadata */}
              <div className="card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  {type === "property" && (
                    <>
                      <MetaField label="Type"       value={listing.type} />
                      <MetaField label="Title Type"  value={listing.title_type} />
                      <MetaField label="Price"       value={`₦${Number(listing.price).toLocaleString()}`} />
                      {listing.size_sqm && <MetaField label="Size" value={`${listing.size_sqm} sqm`} />}
                      {listing.landmarks && <MetaField label="Landmarks" value={listing.landmarks} className="col-span-2" />}
                    </>
                  )}
                  {type === "vehicle" && (
                    <>
                      <MetaField label="Condition"   value={listing.condition} />
                      {listing.condition_score && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Score</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-sm font-semibold text-slate-200">{listing.condition_score}/10</span>
                          </div>
                        </div>
                      )}
                      <MetaField label="Price"   value={`₦${Number(listing.price).toLocaleString()}`} />
                      {listing.mileage_km != null && <MetaField label="Mileage" value={`${listing.mileage_km.toLocaleString()} km`} />}
                      {listing.vin   && <MetaField label="VIN"   value={listing.vin}   className="col-span-2" />}
                      {listing.color && <MetaField label="Color" value={listing.color} />}
                    </>
                  )}
                </div>
                {listing.description && (
                  <div className="mt-2 pt-3 border-t border-surface-border">
                    <p className="text-xs text-slate-500 mb-1">Owner Description</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{listing.description}</p>
                  </div>
                )}
              </div>

              {/* Documents & Images */}
              <div className="card overflow-hidden">
                <div className="flex border-b border-surface-border">
                  {(["docs", "images"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveDocTab(tab)}
                      className={clsx(
                        "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer",
                        activeDocTab === tab
                          ? "text-brand border-b-2 border-brand bg-brand/5"
                          : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {tab === "docs"
                        ? `Documents (${listing.document_urls?.length || 0})`
                        : `Photos (${listing.image_urls?.length || 0})`}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {activeDocTab === "docs" && (
                    <div className="space-y-2">
                      {type === "vehicle" && listing.clearing_papers_url && (
                        <DocLink label="Customs Clearing Papers" url={listing.clearing_papers_url} highlight />
                      )}
                      {(listing.document_urls || []).length === 0 && !listing.clearing_papers_url ? (
                        <p className="text-xs text-slate-500 text-center py-4">No documents uploaded</p>
                      ) : (
                        (listing.document_urls || []).map((url: string, i: number) => (
                          <DocLink key={i} label={`Document ${i + 1}`} url={url} />
                        ))
                      )}
                    </div>
                  )}
                  {activeDocTab === "images" && (
                    <div className="grid grid-cols-2 gap-2">
                      {(listing.image_urls || []).length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4 col-span-2">No images uploaded</p>
                      ) : (
                        (listing.image_urls || []).map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="relative aspect-video rounded-lg bg-surface-raised border border-surface-border overflow-hidden group cursor-pointer">
                            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-5 h-5 text-white drop-shadow" />
                            </div>
                          </a>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* YouTube embed */}
              {listing.youtube_video_id && (
                <div className="card overflow-hidden">
                  <div className="flex items-center gap-2 p-3 border-b border-surface-border">
                    <Youtube className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-semibold text-slate-300">Video Tour</span>
                    <a
                      href={`https://www.youtube.com/watch?v=${listing.youtube_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-brand hover:text-brand-hover flex items-center gap-1 cursor-pointer"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${listing.youtube_video_id}`}
                      title="Listing video tour"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Admin editing panel */}
          <div className="overflow-y-auto">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">Admin Copy Editor</h3>
                <p className="text-xs text-slate-500">Rewrite or tune the listing before publishing. Leave blank to use owner-submitted copy.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <Tag className="inline w-3 h-3 mr-1" />
                    Published Title
                  </label>
                  <input
                    className="input"
                    placeholder={displayTitle}
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                  />
                  {adminTitle ? (
                    <p className="mt-1 text-xs text-success">✓ Will override owner title</p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-600">Fallback: owner's submitted title</p>
                  )}
                </div>

                <div>
                  <label className="label">Published Description</label>
                  <textarea
                    className="input min-h-[120px] resize-none"
                    placeholder={listing.description || "Write a polished description…"}
                    value={adminDescription}
                    onChange={(e) => setAdminDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">
                    Published Price (₦){" "}
                    <span className="text-slate-600 normal-case">— owner asked ₦{Number(listing.price).toLocaleString()}</span>
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    placeholder={String(listing.price)}
                    value={adminPrice}
                    onChange={(e) => setAdminPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">Internal Admin Notes</label>
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="Internal notes (never shown publicly)…"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Success/error messages */}
              {successMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Bar (fixed bottom) ─────────────────────────────────── */}
      <div className="shrink-0 border-t border-surface-border bg-surface-card px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Submitted by <span className="text-slate-300 font-medium">{listing.owner_name}</span>
            {" · "}#{id.slice(0, 8)}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRejectModal(true)}
              className="btn-danger"
              disabled={publishing || rejecting}
            >
              <XCircle className="w-4 h-4" />
              Reject Submission
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || rejecting}
              className="btn-success"
            >
              {publishing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Publish Live
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Reject confirmation modal ─────────────────────────────────── */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setRejectModal(false)}
        >
          <div className="card w-full max-w-md p-6 space-y-4 animate-slide-up shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-danger/15 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Reject Submission</h3>
                <p className="text-xs text-slate-400">Provide a reason for the rejection</p>
              </div>
            </div>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="e.g. Documents appear unclear or incomplete. Please resubmit with a higher-quality scan of your C of O."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal(false)} className="btn-ghost">Cancel</button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejecting}
                className="btn-danger"
              >
                {rejecting ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaField({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

function DocLink({ label, url, highlight = false }: { label: string; url: string; highlight?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors duration-150 cursor-pointer group",
        highlight
          ? "border-amber-500/30 bg-amber-500/8 hover:bg-amber-500/15"
          : "border-surface-border hover:bg-surface-raised"
      )}
    >
      <FileText className={clsx("w-4 h-4 shrink-0", highlight ? "text-amber-400" : "text-slate-400")} />
      <span className={clsx("text-sm flex-1 truncate", highlight ? "text-amber-300 font-medium" : "text-slate-300")}>{label}</span>
      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
    </a>
  );
}
