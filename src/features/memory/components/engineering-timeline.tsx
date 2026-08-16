"use client";

import { useState } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  History,
  ShieldAlert,
  FileText,
  ChevronRight,
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  eventType:
    | "DECISION"
    | "ASSUMPTION_CHANGE"
    | "REJECTED_OPTION"
    | "QUALITY_FAILURE"
    | "REVISION_CHANGE"
    | "AUDIT";
  title: string;
  description: string;
  timestamp: string;
  authorName?: string;
  severity?: string;
  metadata?: Record<string, unknown>;
}

interface EngineeringTimelineProps {
  events: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
}

export function EngineeringTimeline({ events, onSelectEvent }: EngineeringTimelineProps) {
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredEvents = events.filter((e) => {
    if (filterType === "ALL") return true;
    return e.eventType === filterType;
  });

  const getEventBadge = (type: TimelineEvent["eventType"]) => {
    switch (type) {
      case "DECISION":
        return (
          <span className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
            <CheckCircle2 className="h-3 w-3" /> Decision
          </span>
        );
      case "ASSUMPTION_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
            <AlertTriangle className="h-3 w-3" /> Assumption
          </span>
        );
      case "REJECTED_OPTION":
        return (
          <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-400">
            <ShieldAlert className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
            <FileText className="h-3 w-3" /> Event
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 font-sans text-slate-900 shadow-2xl">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <History className="h-5 w-5 text-indigo-400" /> Engineering Memory Timeline
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Chronological replay of design evolution, assumption changes, decision approvals, and
            quality events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "DECISION", "ASSUMPTION_CHANGE", "REJECTED_OPTION"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === t
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {t === "ALL" ? "All Events" : t.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-6 space-y-6 border-l-2 border-slate-200 pl-6">
        {filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No timeline events match the selected filter.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent?.(evt)}
              className="group relative cursor-pointer rounded-lg border border-slate-200 bg-slate-100 p-4 shadow-md transition-all hover:border-slate-200 hover:bg-slate-100"
            >
              <div className="absolute top-5 -left-[31px] h-4 w-4 rounded-full border-2 border-indigo-500 bg-white transition-all group-hover:scale-125 group-hover:border-indigo-400" />

              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getEventBadge(evt.eventType)}
                  <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
                    <Clock className="h-3 w-3" /> {new Date(evt.timestamp).toLocaleDateString()}{" "}
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {evt.authorName && (
                  <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {evt.authorName}
                  </span>
                )}
              </div>

              <h3 className="flex items-center justify-between text-sm font-semibold text-slate-900 transition-colors group-hover:text-indigo-300">
                {evt.title}
                <ChevronRight className="h-4 w-4 text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>

              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-700">
                {evt.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
