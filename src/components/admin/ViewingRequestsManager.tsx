"use client";

import {
  CalendarBlankIcon as CalendarDays,
  ClockIcon as Clock,
  EnvelopeIcon as Mail,
  QuotesIcon as MessageSquareQuote,
  PhoneIcon as Phone,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ViewingRequest, ViewingRequestStatus } from "@/lib/types";

const STATUSES: ViewingRequestStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled"];

const statusStyles: Record<ViewingRequestStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-accent-light text-accent-dark",
  Completed: "bg-blue-50 text-blue-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return [parts[0]?.[0], parts[parts.length - 1]?.[0]].filter(Boolean).join("").toUpperCase();
}

export function ViewingRequestsManager({ initialRequests }: { initialRequests: ViewingRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: ViewingRequestStatus) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to update viewing request status.");
      return;
    }
    setBusyId(id);
    const { error: updateError } = await createClient().from("viewing_requests").update({ status }).eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Viewing Requests</h1>
        <p className="mt-1 text-sm text-foreground/60">{requests.length} requests</p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-foreground/50">
          No viewing requests yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent-dark">
                    {initials(r.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {r.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {r.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <select
                  value={r.status}
                  disabled={busyId === r.id}
                  onChange={(e) => handleStatusChange(r.id, e.target.value as ViewingRequestStatus)}
                  className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none disabled:opacity-50 ${statusStyles[r.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {r.propertyText && (
                  <span className="rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/70">
                    Property: <span className="font-medium text-foreground">{r.propertyText}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/70">
                  <CalendarDays className="h-3 w-3" />
                  <span className="font-medium text-foreground">{r.preferredDate}</span>
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/70">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium text-foreground">{r.preferredTime}</span>
                </span>
              </div>

              {r.message && (
                <div className="mt-4 flex gap-2 rounded-xl bg-muted p-3 text-sm text-foreground/70">
                  <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-foreground/30" />
                  <p>{r.message}</p>
                </div>
              )}

              <p className="mt-3 text-xs text-foreground/40">
                Submitted {new Date(r.createdAt).toLocaleDateString("en-PH")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
