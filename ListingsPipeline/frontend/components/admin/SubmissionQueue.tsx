"use client";
import { useState, useEffect } from "react";
import { fetchPendingSubmissions } from "@/lib/api";
import { Home, Car, Clock, RefreshCw, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface QueueItem {
  id: string;
  type: "property" | "vehicle";
  title?: string;
  make?: string;
  model?: string;
  year?: number;
  location: string;
  price: number;
  owner_name: string;
  created_at: string;
}

interface Props {
  selectedId: string | null;
  selectedType: "property" | "vehicle" | null;
  onSelect: (id: string, type: "property" | "vehicle") => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SubmissionQueue({ selectedId, selectedType, onSelect }: Props) {
  const [items,    setItems]    = useState<QueueItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"all" | "property" | "vehicle">("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingSubmissions();
      const props = (res.data.properties?.items || []).map((p: any) => ({ ...p, type: "property" }));
      const vehs  = (res.data.vehicles?.items  || []).map((v: any) => ({ ...v, type: "vehicle"  }));
      const merged = [...props, ...vehs].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setItems(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);
  const propCount = items.filter((i) => i.type === "property").length;
  const vehCount  = items.filter((i) => i.type === "vehicle").length;

  return (
    <div className="flex flex-col h-full">
      {/* Queue header */}
      <div className="p-4 border-b border-surface-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Pending Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">{items.length} awaiting review</p>
          </div>
          <button onClick={load} className="btn-ghost p-2" aria-label="Refresh">
            <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-surface-raised rounded-lg">
          {[
            { value: "all"      as const, label: `All (${items.length})` },
            { value: "property" as const, label: `Property (${propCount})` },
            { value: "vehicle"  as const, label: `Vehicle (${vehCount})` },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={clsx(
                "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors duration-150 cursor-pointer",
                filter === tab.value
                  ? "bg-surface-card text-slate-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-raised rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No pending submissions
          </div>
        ) : (
          <ul className="p-2 space-y-1">
            {filtered.map((item) => {
              const isActive = item.id === selectedId && item.type === selectedType;
              const displayTitle = item.type === "property"
                ? (item.title || "Untitled Property")
                : `${item.year} ${item.make} ${item.model}`;

              return (
                <li key={`${item.type}-${item.id}`}>
                  <button
                    onClick={() => onSelect(item.id, item.type)}
                    className={clsx(
                      "w-full text-left p-3 rounded-lg transition-all duration-150 cursor-pointer group",
                      isActive
                        ? "bg-brand/15 border border-brand/40"
                        : "hover:bg-surface-raised border border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={clsx(
                        "w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
                        item.type === "property" ? "bg-brand/15" : "bg-purple-500/15"
                      )}>
                        {item.type === "property"
                          ? <Home className="w-3.5 h-3.5 text-brand" />
                          : <Car  className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{displayTitle}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.location}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-slate-400">
                            ₦{Number(item.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-600">{timeAgo(item.created_at)}</span>
                        </div>
                      </div>
                      <ChevronRight className={clsx(
                        "w-3.5 h-3.5 shrink-0 mt-1 transition-colors",
                        isActive ? "text-brand" : "text-slate-600 group-hover:text-slate-400"
                      )} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
