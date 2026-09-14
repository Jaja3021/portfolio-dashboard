"use client";

import { CalendarCheckIcon as CalendarCheck, ChatCircleTextIcon as MessageSquareText } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Inquiry, ViewingRequest } from "@/lib/types";

type Item =
  | { kind: "inquiry"; data: Inquiry }
  | { kind: "viewing"; data: ViewingRequest };

export function NotificationsFeed({
  initialInquiries,
  initialViewingRequests,
}: {
  initialInquiries: Inquiry[];
  initialViewingRequests: ViewingRequest[];
}) {
  const [inquiries, setInquiries] = useState(initialInquiries.filter((i) => i.status === "New"));
  const [viewings, setViewings] = useState(initialViewingRequests.filter((v) => v.status === "Pending"));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dismissInquiry = async (id: string) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to update inquiries.");
      return;
    }
    setBusyId(id);
    const { error: updateError } = await createClient().from("inquiries").update({ status: "Contacted" }).eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  };

  const dismissViewing = async (id: string) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to update viewing requests.");
      return;
    }
    setBusyId(id);
    const { error: updateError } = await createClient()
      .from("viewing_requests")
      .update({ status: "Confirmed" })
      .eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setViewings((prev) => prev.filter((v) => v.id !== id));
  };

  const items: Item[] = [
    ...inquiries.map((data): Item => ({ kind: "inquiry", data })),
    ...viewings.map((data): Item => ({ kind: "viewing", data })),
  ].sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-foreground/60">
          {items.length} item{items.length === 1 ? "" : "s"} need attention
        </p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-foreground/50">
          You&apos;re all caught up.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={`${item.kind}-${item.data.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-light">
                  {item.kind === "inquiry" ? (
                    <MessageSquareText className="h-4 w-4 text-accent" />
                  ) : (
                    <CalendarCheck className="h-4 w-4 text-accent" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.kind === "inquiry" ? "New inquiry from " : "Viewing request from "}
                    {item.data.name}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {item.kind === "inquiry"
                      ? item.data.preferredProperty ?? "No property specified"
                      : `${item.data.propertyText ?? "Property viewing"} — ${item.data.preferredDate} ${item.data.preferredTime}`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground/40">
                    {new Date(item.data.createdAt).toLocaleString("en-PH")}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={busyId === item.data.id}
                onClick={() => (item.kind === "inquiry" ? dismissInquiry(item.data.id) : dismissViewing(item.data.id))}
              >
                {item.kind === "inquiry" ? "Mark Contacted" : "Confirm"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
