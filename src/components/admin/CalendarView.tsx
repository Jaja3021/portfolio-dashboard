"use client";

import {
  CalendarBlankIcon as CalendarIcon,
  CaretLeftIcon as ChevronLeft,
  CaretRightIcon as ChevronRight,
  ClockIcon as FollowUpIcon,
  HouseIcon as Home,
  ListIcon,
  MagnifyingGlassIcon as SearchIcon,
} from "@phosphor-icons/react/ssr";
import { useMemo, useState } from "react";
import type { Client, ViewingRequest, ViewingRequestStatus } from "@/lib/types";

type EventStatus = ViewingRequestStatus | "Follow-up";

interface AgendaItem {
  id: string;
  kind: "viewing" | "follow-up";
  date: string; // YYYY-MM-DD
  time: string | null;
  name: string;
  detail: string;
  status: EventStatus;
}

const STATUS_STYLES: Record<EventStatus, { dot: string; pill: string }> = {
  Pending: { dot: "bg-amber-400", pill: "bg-amber-50 text-amber-700" },
  Confirmed: { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700" },
  Completed: { dot: "bg-blue-400", pill: "bg-blue-50 text-blue-700" },
  Cancelled: { dot: "bg-gray-400", pill: "bg-gray-100 text-gray-500" },
  "Follow-up": { dot: "bg-violet-400", pill: "bg-violet-50 text-violet-700" },
};

const ALL_STATUSES: EventStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled", "Follow-up"];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MAX_VISIBLE_PER_DAY = 2;

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthGridDays(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstOfMonth.getDay();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function CalendarView({
  viewingRequests,
  clients,
}: {
  viewingRequests: ViewingRequest[];
  clients: Client[];
}) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");

  const items: AgendaItem[] = useMemo(
    () => [
      ...viewingRequests
        .filter((v) => v.status !== "Cancelled")
        .map((v): AgendaItem => ({
          id: `viewing-${v.id}`,
          kind: "viewing",
          date: v.preferredDate,
          time: v.preferredTime,
          name: v.name,
          detail: v.propertyText ?? "Property viewing",
          status: v.status,
        })),
      ...clients
        .filter((c) => c.nextFollowUp)
        .map((c): AgendaItem => ({
          id: `follow-up-${c.id}`,
          kind: "follow-up",
          date: c.nextFollowUp as string,
          time: null,
          name: c.name,
          detail: "Scheduled follow-up",
          status: "Follow-up",
        })),
    ],
    [viewingRequests, clients]
  );

  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(items.map((i) => i.date.slice(0, 7)))).sort();
    if (!keys.includes(monthKey(cursor))) keys.push(monthKey(cursor));
    return keys.sort();
  }, [items, cursor]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (monthFilter !== "all" && !item.date.startsWith(monthFilter)) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.detail.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, statusFilter, monthFilter]);

  const itemsByDate = useMemo(() => {
    const map: Record<string, AgendaItem[]> = {};
    for (const item of filteredItems) {
      (map[item.date] ??= []).push(item);
    }
    for (const date of Object.keys(map)) {
      map[date].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    }
    return map;
  }, [filteredItems]);

  const bookingsThisMonth = useMemo(
    () => filteredItems.filter((i) => i.date.startsWith(monthKey(cursor))).length,
    [filteredItems, cursor]
  );

  const gridDays = useMemo(() => getMonthGridDays(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  const goPrevMonth = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNextMonth = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  const handleMonthFilterChange = (value: string) => {
    setMonthFilter(value);
    if (value !== "all") {
      const [y, m] = value.split("-").map(Number);
      setCursor(new Date(y, m - 1, 1));
    }
  };

  const listDates = Object.keys(itemsByDate).sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Calendar / Schedule</h1>
        <p className="mt-1 text-sm text-foreground/60">Upcoming viewings and client follow-ups, in one timeline.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>

        <select
          value={monthFilter}
          onChange={(e) => handleMonthFilterChange(e.target.value)}
          className="cursor-pointer rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none"
        >
          <option value="all">All Months</option>
          {monthOptions.map((key) => {
            const [y, m] = key.split("-").map(Number);
            const label = new Date(y, m - 1, 1).toLocaleDateString("en-PH", { month: "long", year: "numeric" });
            return (
              <option key={key} value={key}>
                {label}
              </option>
            );
          })}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | "all")}
          className="cursor-pointer rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none"
        >
          <option value="all">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex gap-1 rounded-xl border border-border bg-white p-1">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "list" ? "bg-accent text-white" : "text-foreground/60 hover:bg-muted"
            }`}
          >
            <ListIcon className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "calendar" ? "bg-accent text-white" : "text-foreground/60 hover:bg-muted"
            }`}
          >
            <CalendarIcon className="h-4 w-4" /> Calendar
          </button>
        </div>
      </div>

      {view === "calendar" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-foreground/60 hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNextMonth}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-foreground/60 hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <p className="ml-2 text-base font-semibold text-foreground">
              {cursor.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-foreground/60">{bookingsThisMonth} bookings this month</p>
            <button
              onClick={goToday}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-muted"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {view === "calendar" ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="overflow-x-auto">
          <div className="min-w-[560px]">
          <div className="grid grid-cols-7 border-b border-border bg-muted/50">
            {WEEKDAYS.map((w) => (
              <div key={w} className="px-2 py-2 text-center text-[11px] font-semibold tracking-wide text-foreground/50">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {gridDays.map((day) => {
              const key = toDateKey(day);
              const inMonth = day.getMonth() === cursor.getMonth();
              const isToday = key === toDateKey(today);
              const dayItems = itemsByDate[key] ?? [];
              const visible = dayItems.slice(0, MAX_VISIBLE_PER_DAY);
              const extra = dayItems.length - visible.length;

              return (
                <div
                  key={key}
                  className={`min-h-[104px] border-b border-r border-border p-1.5 last:border-r-0 ${
                    inMonth ? "bg-white" : "bg-muted/30"
                  }`}
                >
                  <div className="flex justify-end">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday
                          ? "bg-accent font-semibold text-white"
                          : inMonth
                            ? "text-foreground/70"
                            : "text-foreground/30"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1">
                    {visible.map((item) => (
                      <div
                        key={item.id}
                        title={`${item.name} — ${item.detail}`}
                        className={`truncate rounded-md px-1.5 py-1 text-[11px] font-medium leading-tight ${STATUS_STYLES[item.status].pill}`}
                      >
                        {item.time && <span className="font-semibold">{item.time.slice(0, 5)} </span>}
                        {item.name}
                      </div>
                    ))}
                    {extra > 0 && <p className="px-1.5 text-[11px] font-medium text-foreground/50">+{extra} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-border px-4 py-3">
            {(["Confirmed", "Pending", "Completed", "Follow-up"] as EventStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-foreground/60">
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[s].dot}`} />
                {s === "Pending" ? "Not confirmed" : s}
              </span>
            ))}
          </div>
        </div>
      ) : listDates.length === 0 ? (
        <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-foreground/50">
          Nothing scheduled yet.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {listDates.map((date) => (
            <div key={date}>
              <p className="mb-3 text-sm font-semibold text-foreground">
                {new Date(date).toLocaleDateString("en-PH", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="flex flex-col gap-3">
                {itemsByDate[date].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-light">
                      {item.kind === "viewing" ? (
                        <Home className="h-4 w-4 text-accent" />
                      ) : (
                        <FollowUpIcon className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {item.name}
                        {item.time && <span className="ml-2 font-normal text-foreground/50">{item.time}</span>}
                      </p>
                      <p className="text-xs text-foreground/60">{item.detail}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLES[item.status].pill}`}
                    >
                      {item.status === "Pending" ? "Not confirmed" : item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
