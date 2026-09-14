"use client";

import {
  EnvelopeIcon as Mail,
  QuotesIcon as MessageSquareQuote,
  PhoneIcon as Phone,
  WalletIcon as Wallet,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Inquiry, InquiryStatus } from "@/lib/types";

const STATUSES: InquiryStatus[] = ["New", "Contacted", "In Progress", "Closed"];

const statusStyles: Record<InquiryStatus, string> = {
  New: "bg-accent-light text-accent-dark",
  Contacted: "bg-blue-50 text-blue-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Closed: "bg-gray-100 text-gray-500",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return [parts[0]?.[0], parts[parts.length - 1]?.[0]].filter(Boolean).join("").toUpperCase();
}

export function InquiriesManager({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to update inquiry status.");
      return;
    }
    setBusyId(id);
    const { error: updateError } = await createClient().from("inquiries").update({ status }).eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Inquiries</h1>
        <p className="mt-1 text-sm text-foreground/60">{inquiries.length} submissions</p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {inquiries.length === 0 ? (
        <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-foreground/50">
          No inquiries yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {inquiries.map((i) => (
            <div key={i.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent-dark">
                    {initials(i.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{i.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {i.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {i.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <select
                  value={i.status}
                  disabled={busyId === i.id}
                  onChange={(e) => handleStatusChange(i.id, e.target.value as InquiryStatus)}
                  className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none disabled:opacity-50 ${statusStyles[i.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {(i.preferredProperty || i.preferredLocation || i.budget) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {i.preferredProperty && (
                    <span className="rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/70">
                      Property: <span className="font-medium text-foreground">{i.preferredProperty}</span>
                    </span>
                  )}
                  {i.preferredLocation && (
                    <span className="rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/70">
                      Location: <span className="font-medium text-foreground">{i.preferredLocation}</span>
                    </span>
                  )}
                  {i.budget && (
                    <span className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/70">
                      <Wallet className="h-3 w-3" />
                      <span className="font-medium text-foreground">{i.budget}</span>
                    </span>
                  )}
                </div>
              )}

              {i.message && (
                <div className="mt-4 flex gap-2 rounded-xl bg-muted p-3 text-sm text-foreground/70">
                  <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-foreground/30" />
                  <p>{i.message}</p>
                </div>
              )}

              <p className="mt-3 text-xs text-foreground/40">
                Submitted {new Date(i.createdAt).toLocaleDateString("en-PH")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
