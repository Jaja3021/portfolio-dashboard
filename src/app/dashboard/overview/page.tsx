import {
  CalendarBlankIcon as CalendarBlank,
  CalendarCheckIcon as CalendarCheck,
  ChatsCircleIcon as ChatsCircle,
  ChatCircleTextIcon as MessageSquareText,
  EyeIcon as Eye,
  WalletIcon as Wallet,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { DailyViewsChart } from "@/components/admin/DailyViewsChart";
import { DonutChart } from "@/components/admin/DonutChart";
import { getAnalyticsOverview, getDashboardOverview } from "@/lib/data";
import { PUBLIC_SITE_URL } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { InquiryStatus, ViewingRequestStatus } from "@/lib/types";

const INQUIRY_STATUS_STYLES: Record<InquiryStatus, string> = {
  New: "bg-accent-light text-accent-dark",
  Contacted: "bg-blue-50 text-blue-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Closed: "bg-gray-100 text-gray-500",
};

const VIEWING_STATUS_STYLES: Record<ViewingRequestStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-accent-light text-accent-dark",
  Completed: "bg-blue-50 text-blue-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

const VIEWING_STATUS_DOTS: Record<ViewingRequestStatus, string> = {
  Pending: "bg-amber-400",
  Confirmed: "bg-accent",
  Completed: "bg-blue-500",
  Cancelled: "bg-gray-400",
};

export default async function AdminOverviewPage() {
  const [analytics, overview] = await Promise.all([getAnalyticsOverview(), getDashboardOverview()]);
  const { kpis, viewingStatus, recentInquiries, upcomingViewings } = overview;
  const lastUpdated = new Date().toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const formatDate = (isoDate: string) =>
    new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-foreground/60">Business performance at a glance</p>
        </div>
        <p className="text-xs text-foreground/40">Last updated {lastUpdated}</p>
      </div>

      {!isSupabaseConfigured && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Connect Supabase and run <code>supabase/analytics.sql</code> to start tracking real visits.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={Wallet}
          iconClassName="bg-accent-light text-accent"
          label="Closed Revenue"
          value={formatPrice(kpis.closedRevenue)}
          caption={`${kpis.closedRevenueCount} closed deal${kpis.closedRevenueCount === 1 ? "" : "s"}`}
          href="/dashboard/deals"
        />
        <KpiCard
          icon={MessageSquareText}
          iconClassName="bg-blue-50 text-blue-600"
          label="New Inquiries"
          value={kpis.inquiriesNew.toLocaleString("en-PH")}
          caption={`of ${kpis.inquiriesTotal.toLocaleString("en-PH")} total`}
          href="/dashboard/inquiries"
        />
        <KpiCard
          icon={CalendarCheck}
          iconClassName="bg-emerald-50 text-emerald-600"
          label="Confirmed Bookings"
          value={kpis.confirmedBookings.toLocaleString("en-PH")}
          caption="Viewings confirmed"
          href="/dashboard/viewing-requests"
        />
        <KpiCard
          icon={ChatsCircle}
          iconClassName="bg-violet-50 text-violet-600"
          label="Conversations"
          value={kpis.conversationsTotal.toLocaleString("en-PH")}
          caption={
            kpis.conversationsNeedingReply > 0
              ? `${kpis.conversationsNeedingReply} awaiting reply`
              : "All caught up"
          }
          href="/dashboard/conversations"
        />
        <KpiCard
          icon={Eye}
          iconClassName="bg-slate-100 text-slate-500"
          label="Website Views"
          value={kpis.websiteViews.toLocaleString("en-PH")}
          caption={`${kpis.websiteViewsThisWeek.toLocaleString("en-PH")} this week`}
          href={PUBLIC_SITE_URL}
          external
        />
        <KpiCard
          icon={CalendarBlank}
          iconClassName="bg-amber-50 text-amber-600"
          label="Calendar / Schedule"
          value={kpis.calendarUpcoming.toLocaleString("en-PH")}
          caption="Upcoming viewings & follow-ups"
          href="/dashboard/calendar"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-white p-6 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Views Overview</h2>
            <p className="text-xs text-foreground/50">Daily site visits, last 30 days</p>
          </div>
          <DailyViewsChart data={analytics.dailyViews} />
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Traffic Sources</h2>
            <p className="text-xs text-foreground/50">Where visits come from</p>
          </div>
          <DonutChart data={analytics.topReferrers} />
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Inquiries</h2>
            <Link href="/dashboard/inquiries" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-foreground/50">No inquiries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-foreground/50">
                  <tr>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Property</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map((i) => (
                    <tr key={i.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-foreground">{i.name}</td>
                      <td className="py-2.5 pr-3 text-foreground/60">{i.preferredProperty ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-foreground/60">
                        {new Date(i.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${INQUIRY_STATUS_STYLES[i.status]}`}
                        >
                          {i.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Upcoming Viewings</h2>
            <Link href="/dashboard/viewing-requests" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          {upcomingViewings.length === 0 ? (
            <p className="text-sm text-foreground/50">Nothing scheduled yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingViewings.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{v.name}</p>
                    <p className="truncate text-xs text-foreground/50">{v.propertyText ?? "Property TBD"}</p>
                    <p className="mt-1 text-[11px] text-foreground/40">
                      {formatDate(v.preferredDate)} · {v.preferredTime}
                      {v.preferredDate < todayKey && v.status === "Pending" && (
                        <span className="ml-1.5 font-medium text-rose-600">· Overdue</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${VIEWING_STATUS_STYLES[v.status]}`}
                  >
                    {v.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-white p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Booking Status Overview</h2>
          <p className="text-xs text-foreground/50">All viewing requests, all time</p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          {(
            [
              ["Confirmed", viewingStatus.confirmed],
              ["Pending / New", viewingStatus.pending],
              ["Completed", viewingStatus.completed],
              ["Cancelled", viewingStatus.cancelled],
            ] as [string, number][]
          ).map(([label, count]) => {
            const key = (label === "Pending / New" ? "Pending" : label) as ViewingRequestStatus;
            return (
              <div key={label} className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${VIEWING_STATUS_DOTS[key]}`} />
                <p className="text-lg font-semibold text-foreground">{count}</p>
                <p className="text-xs text-foreground/50">{label}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  caption,
  href,
  external = false,
}: {
  icon: typeof Wallet;
  iconClassName: string;
  label: string;
  value: string;
  caption: string;
  href: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="block rounded-2xl border border-border bg-white p-5 transition-colors hover:border-accent"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-medium text-foreground/50">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-foreground/50">{caption}</p>
    </Link>
  );
}
