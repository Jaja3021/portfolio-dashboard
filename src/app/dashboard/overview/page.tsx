import {
  ArrowBendUpLeftIcon as BounceIcon,
  CalendarIcon as Calendar,
  CalendarBlankIcon as CalendarDays,
  EyeIcon as Eye,
  TimerIcon as Timer,
  UsersIcon as Users,
} from "@phosphor-icons/react/ssr";
import { DailyViewsChart } from "@/components/admin/DailyViewsChart";
import { getAnalyticsOverview, getPageViewStats, type Trend } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const [stats, analytics] = await Promise.all([getPageViewStats(), getAnalyticsOverview()]);
  const lastUpdated = new Date().toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-foreground/60">Portfolio site visits</p>
        </div>
        <p className="text-xs text-foreground/40">Last updated {lastUpdated}</p>
      </div>

      {!isSupabaseConfigured && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Connect Supabase and run <code>supabase/analytics.sql</code> to start tracking real visits.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Eye} label="Total Views" value={stats.total} />
        <StatCard icon={Calendar} label="Views Today" value={stats.today} />
        <StatCard icon={CalendarDays} label="Views This Week" value={stats.thisWeek} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Unique Visitors"
          value={analytics.uniqueVisitors}
          trend={analytics.uniqueVisitorsTrend}
          periodLabel="last week"
        />
        <StatCard
          icon={CalendarDays}
          label="Views This Month"
          value={analytics.viewsLast30Days}
          trend={analytics.viewsLast30DaysTrend}
          periodLabel="last 30 days"
        />
        <StatCard
          icon={BounceIcon}
          label="Bounce Rate"
          value={analytics.bounceRate}
          trend={analytics.bounceRateTrend}
          periodLabel="last week"
          format={(v) => `${v.toFixed(1)}%`}
          goodDirection="down"
        />
        <StatCard
          icon={Timer}
          label="Average Time on Page"
          value={analytics.avgTimeOnPageSeconds}
          trend={analytics.avgTimeOnPageTrend}
          periodLabel="last week"
          format={formatDuration}
        />
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-white p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Daily Views</h2>
          <p className="text-xs text-foreground/50">Last 30 days</p>
        </div>
        <DailyViewsChart data={analytics.dailyViews} />
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Top Referrers</h2>
          {analytics.topReferrers.length === 0 ? (
            <p className="text-sm text-foreground/50">No visits recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {analytics.topReferrers.map((r) => {
                const total = analytics.topReferrers.reduce((sum, x) => sum + x.count, 0);
                const pct = total > 0 ? (r.count / total) * 100 : 0;
                return (
                  <li key={r.label} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate text-sm text-foreground/80">{r.label}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-10 shrink-0 text-right text-sm font-medium text-foreground">{r.count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Most Viewed Pages</h2>
          {analytics.topPages.length === 0 ? (
            <p className="text-sm text-foreground/50">No visits recorded yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {analytics.topPages.map((p, i) => (
                <li key={p.path} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-foreground/80">{p.path}</span>
                  <span className="shrink-0 text-sm font-medium text-foreground">{p.count.toLocaleString("en-PH")}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TrendBadge({ trend, goodDirection }: { trend: Trend; goodDirection: "up" | "down" }) {
  if (trend.isNew) {
    return <span className="rounded-full bg-accent-light px-2 py-0.5 text-[11px] font-medium text-accent-dark">New</span>;
  }
  if (trend.pct === null) {
    return <span className="text-[11px] text-foreground/40">No prior data</span>;
  }
  if (trend.pct === 0) {
    return <span className="text-[11px] text-foreground/40">No change</span>;
  }
  const isIncrease = trend.pct > 0;
  const isGood = isIncrease === (goodDirection === "up");
  const arrow = isIncrease ? "▲" : "▼";
  return (
    <span className={`text-[11px] font-medium ${isGood ? "text-green-600" : "text-red-500"}`}>
      {arrow} {Math.abs(trend.pct).toFixed(0)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  periodLabel,
  format,
  goodDirection = "up",
}: {
  icon: typeof Eye;
  label: string;
  value: number | null;
  trend?: Trend;
  periodLabel?: string;
  format?: (value: number) => string;
  goodDirection?: "up" | "down";
}) {
  const displayValue = value === null ? "—" : format ? format(value) : value.toLocaleString("en-PH");

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="w-fit rounded-xl bg-accent-light p-3">
          <Icon className="h-5 w-5 text-accent" />
        </span>
        {trend && value !== null && <TrendBadge trend={trend} goodDirection={goodDirection} />}
      </div>
      <p className="text-3xl font-semibold text-foreground">{displayValue}</p>
      <p className="mt-1 text-sm text-foreground/60">{label}</p>
      {value === null && trend && <p className="mt-1 text-[11px] text-foreground/40">Needs visitor session tracking</p>}
      {value !== null && periodLabel && trend && !trend.isNew && trend.pct !== null && trend.pct !== 0 && (
        <p className="mt-1 text-[11px] text-foreground/40">vs {periodLabel}</p>
      )}
    </div>
  );
}
