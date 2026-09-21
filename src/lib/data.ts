import "server-only";

import { createAnonClient, createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  ClientRow,
  ConversationRow,
  DealRow,
  InquiryRow,
  PageViewRow,
  PropertyRow,
  SiteSettingsRow,
  TestimonialRow,
  ViewingRequestRow,
} from "@/lib/supabase/types";
import {
  MOCK_CLIENTS,
  MOCK_CONVERSATIONS,
  MOCK_DEALS,
  MOCK_INQUIRIES,
  MOCK_SETTINGS,
  MOCK_VIEWING_REQUESTS,
  PROPERTIES,
  TESTIMONIALS,
} from "@/lib/mock-data";
import type { Client, Conversation, Deal, Inquiry, Property, SiteSettings, Testimonial, ViewingRequest } from "@/lib/types";

function mapProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    propertyType: row.property_type,
    region: row.region,
    province: row.province,
    city: row.city,
    price: row.price,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    lotArea: row.lot_area,
    floorArea: row.floor_area,
    status: row.status,
    featured: row.featured,
    images: row.property_images?.map((i) => i.image_url) ?? [],
    features: row.features ?? [],
    amenities: row.amenities ?? [],
    nearbyLocations: row.nearby_locations ?? [],
    createdAt: row.created_at,
  };
}

function mapTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? undefined,
    rating: row.rating,
    message: row.message,
    enabled: row.enabled,
  };
}

function mapInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    preferredProperty: row.preferred_property,
    preferredLocation: row.preferred_location,
    budget: row.budget,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapViewingRequest(row: ViewingRequestRow): ViewingRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    propertyText: row.property_text,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    status: row.status,
    notes: row.notes,
    nextFollowUp: row.next_follow_up,
    createdAt: row.created_at,
  };
}

function mapConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    sessionId: row.session_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    humanTakeover: row.human_takeover,
    messages: (row.messages ?? [])
      .map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.created_at }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

function mapDeal(row: DealRow): Deal {
  return {
    id: row.id,
    clientName: row.client_name,
    propertyTitle: row.property_title,
    stage: row.stage,
    amount: row.amount,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    phone: row.phone,
    email: row.email,
    facebook: row.facebook,
    instagram: row.instagram,
    tiktok: row.tiktok,
    youtube: row.youtube,
    notifyOnInquiry: row.notify_on_inquiry,
    notifyOnViewing: row.notify_on_viewing,
  };
}

// Falls back to local mock data until NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are set
// (see .env.example) — this keeps the site fully functional before Phase 2 wiring
// is connected to a real project, and is the only place that needs to change.
export async function getProperties(): Promise<Property[]> {
  if (!isSupabaseConfigured) return PROPERTIES;

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(image_url)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load properties from Supabase:", error?.message);
    return PROPERTIES;
  }

  return (data as PropertyRow[]).map(mapProperty);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured) return TESTIMONIALS;

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("enabled", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load testimonials from Supabase:", error?.message);
    return TESTIMONIALS;
  }

  return (data as TestimonialRow[]).map(mapTestimonial);
}

// --- Admin-only reads (require an authenticated session once Supabase is connected) ---

export async function getAllTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured) return TESTIMONIALS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load testimonials from Supabase:", error?.message);
    return TESTIMONIALS;
  }

  return (data as TestimonialRow[]).map(mapTestimonial);
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (!isSupabaseConfigured) return MOCK_INQUIRIES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load inquiries from Supabase:", error?.message);
    return MOCK_INQUIRIES;
  }

  return (data as InquiryRow[]).map(mapInquiry);
}

export async function getViewingRequests(): Promise<ViewingRequest[]> {
  if (!isSupabaseConfigured) return MOCK_VIEWING_REQUESTS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("viewing_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load viewing requests from Supabase:", error?.message);
    return MOCK_VIEWING_REQUESTS;
  }

  return (data as ViewingRequestRow[]).map(mapViewingRequest);
}

export async function getConversations(): Promise<Conversation[]> {
  if (!isSupabaseConfigured) return MOCK_CONVERSATIONS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*, messages(*)")
    .order("last_message_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load conversations from Supabase:", error?.message);
    return MOCK_CONVERSATIONS;
  }

  return (data as ConversationRow[]).map(mapConversation);
}

export interface NotificationCounts {
  inquiries: number;
  viewingRequests: number;
  conversations: number;
}

function countConversationsNeedingReply(conversations: Conversation[]): number {
  return conversations.filter((c) => {
    const last = c.messages[c.messages.length - 1];
    return last?.role === "user";
  }).length;
}

export async function getNotificationCounts(): Promise<NotificationCounts> {
  if (!isSupabaseConfigured) {
    return {
      inquiries: MOCK_INQUIRIES.filter((i) => i.status === "New").length,
      viewingRequests: MOCK_VIEWING_REQUESTS.filter((v) => v.status === "Pending").length,
      conversations: countConversationsNeedingReply(MOCK_CONVERSATIONS),
    };
  }

  const supabase = await createClient();
  const [inquiries, viewingRequests, conversations] = await Promise.all([
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "New"),
    supabase.from("viewing_requests").select("*", { count: "exact", head: true }).eq("status", "Pending"),
    supabase.from("conversations").select("*, messages(*)").order("last_message_at", { ascending: false }),
  ]);

  if (inquiries.error) console.error("Failed to load inquiry count from Supabase:", inquiries.error.message);
  if (viewingRequests.error)
    console.error("Failed to load viewing request count from Supabase:", viewingRequests.error.message);
  if (conversations.error)
    console.error("Failed to load conversation count from Supabase:", conversations.error.message);

  return {
    inquiries: inquiries.count ?? 0,
    viewingRequests: viewingRequests.count ?? 0,
    conversations: conversations.data
      ? countConversationsNeedingReply((conversations.data as ConversationRow[]).map(mapConversation))
      : 0,
  };
}

export interface DashboardKpis {
  closedRevenue: number;
  closedRevenueCount: number;
  inquiriesTotal: number;
  inquiriesNew: number;
  confirmedBookings: number;
  upcomingViewings: number;
  lostCancelled: number;
  lostCancelledCount: number;
  inPipeline: number;
  inPipelineCount: number;
  conversationsTotal: number;
  conversationsNeedingReply: number;
  websiteViews: number;
  websiteViewsThisWeek: number;
  calendarUpcoming: number;
}

export interface ViewingStatusBreakdown {
  confirmed: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export interface RecentInquiry {
  id: string;
  name: string;
  email: string;
  preferredProperty: string | null;
  status: Inquiry["status"];
  createdAt: string;
}

export interface UpcomingViewing {
  id: string;
  name: string;
  propertyText: string | null;
  preferredDate: string;
  preferredTime: string;
  status: ViewingRequest["status"];
}

export interface DashboardOverview {
  kpis: DashboardKpis;
  viewingStatus: ViewingStatusBreakdown;
  recentInquiries: RecentInquiry[];
  upcomingViewings: UpcomingViewing[];
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [inquiries, viewingRequests, conversations, deals, clients, pageViews] = await Promise.all([
    getInquiries(),
    getViewingRequests(),
    getConversations(),
    getDeals(),
    getClients(),
    getPageViewStats(),
  ]);

  const completedDeals = deals.filter((d) => d.stage === "Completed");
  const cancelledDeals = deals.filter((d) => d.stage === "Cancelled");
  const activeDeals = deals.filter((d) => d.stage !== "Completed" && d.stage !== "Cancelled");

  const todayKey = new Date().toISOString().slice(0, 10);
  const in7DaysKey = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Pending/confirmed requests still need action, whether their requested date
  // is upcoming or already passed (e.g. an unconfirmed request nobody replied to).
  const upcoming = viewingRequests
    .filter((v) => v.status === "Pending" || v.status === "Confirmed")
    .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate));

  const calendarUpcoming =
    viewingRequests.filter((v) => (v.status === "Pending" || v.status === "Confirmed") && v.preferredDate >= todayKey)
      .length + clients.filter((c) => c.nextFollowUp !== null && c.nextFollowUp >= todayKey).length;

  return {
    kpis: {
      closedRevenue: completedDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0),
      closedRevenueCount: completedDeals.length,
      inquiriesTotal: inquiries.length,
      inquiriesNew: inquiries.filter((i) => i.status === "New").length,
      confirmedBookings: viewingRequests.filter((v) => v.status === "Confirmed").length,
      upcomingViewings: upcoming.filter((v) => v.preferredDate <= in7DaysKey).length,
      lostCancelled: cancelledDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0),
      lostCancelledCount: cancelledDeals.length,
      inPipeline: activeDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0),
      inPipelineCount: activeDeals.length,
      conversationsTotal: conversations.length,
      conversationsNeedingReply: countConversationsNeedingReply(conversations),
      websiteViews: pageViews.total,
      websiteViewsThisWeek: pageViews.thisWeek,
      calendarUpcoming,
    },
    viewingStatus: {
      confirmed: viewingRequests.filter((v) => v.status === "Confirmed").length,
      pending: viewingRequests.filter((v) => v.status === "Pending").length,
      completed: viewingRequests.filter((v) => v.status === "Completed").length,
      cancelled: viewingRequests.filter((v) => v.status === "Cancelled").length,
    },
    recentInquiries: inquiries.slice(0, 6).map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      preferredProperty: i.preferredProperty,
      status: i.status,
      createdAt: i.createdAt,
    })),
    upcomingViewings: upcoming.slice(0, 6).map((v) => ({
      id: v.id,
      name: v.name,
      propertyText: v.propertyText,
      preferredDate: v.preferredDate,
      preferredTime: v.preferredTime,
      status: v.status,
    })),
  };
}

export async function getClients(): Promise<Client[]> {
  if (!isSupabaseConfigured) return MOCK_CLIENTS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load clients from Supabase:", error?.message);
    return MOCK_CLIENTS;
  }

  return (data as ClientRow[]).map(mapClient);
}

export async function getDeals(): Promise<Deal[]> {
  if (!isSupabaseConfigured) return MOCK_DEALS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load deals from Supabase:", error?.message);
    return MOCK_DEALS;
  }

  return (data as DealRow[]).map(mapDeal);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return MOCK_SETTINGS;

  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();

  if (error || !data) {
    if (error) console.error("Failed to load site settings from Supabase:", error.message);
    return MOCK_SETTINGS;
  }

  return mapSiteSettings(data as SiteSettingsRow);
}

export interface PageViewStats {
  total: number;
  today: number;
  thisWeek: number;
}

/** Counts distinct sessions (falling back to row count for rows with no session_id) so a
 * visitor reloading the page repeatedly doesn't inflate the view count. */
function countUniqueSessions(rows: { session_id: string | null }[]): number {
  const sessionIds = new Set<string>();
  let untracked = 0;
  for (const row of rows) {
    if (row.session_id) sessionIds.add(row.session_id);
    else untracked += 1;
  }
  return sessionIds.size + untracked;
}

export async function getPageViewStats(): Promise<PageViewStats> {
  if (!isSupabaseConfigured) return { total: 0, today: 0, thisWeek: 0 };

  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, today, thisWeek] = await Promise.all([
    supabase.from("page_views").select("session_id"),
    supabase.from("page_views").select("session_id").gte("created_at", startOfToday.toISOString()),
    supabase.from("page_views").select("session_id").gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  if (total.error?.code === "42703") {
    // session_id column not migrated yet — fall back to raw row counts.
    const [rawTotal, rawToday, rawThisWeek] = await Promise.all([
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
      supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
    ]);
    return { total: rawTotal.count ?? 0, today: rawToday.count ?? 0, thisWeek: rawThisWeek.count ?? 0 };
  }

  if (total.error) console.error("Failed to load page view stats from Supabase:", total.error.message);

  return {
    total: total.data ? countUniqueSessions(total.data) : 0,
    today: today.data ? countUniqueSessions(today.data) : 0,
    thisWeek: thisWeek.data ? countUniqueSessions(thisWeek.data) : 0,
  };
}

// --- Extended Overview analytics (unique visitors, bounce rate, avg time on
// page, daily trend, top referrers/pages) ---

export interface Trend {
  /** Percent change vs. the prior period, or null when there's nothing to compare against. */
  pct: number | null;
  /** True when the prior period was zero and the current period isn't — "new" rather than a percentage. */
  isNew: boolean;
}

export interface DailyViewPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ReferrerCount {
  label: string;
  count: number;
}

export interface PageCount {
  path: string;
  count: number;
}

export interface AnalyticsOverview {
  viewsLast30Days: number;
  viewsLast30DaysTrend: Trend;
  uniqueVisitors: number | null;
  uniqueVisitorsTrend: Trend;
  bounceRate: number | null;
  bounceRateTrend: Trend;
  avgTimeOnPageSeconds: number | null;
  avgTimeOnPageTrend: Trend;
  dailyViews: DailyViewPoint[];
  topReferrers: ReferrerCount[];
  topPages: PageCount[];
}

function computeTrend(current: number, previous: number): Trend {
  if (previous === 0) return { pct: current === 0 ? 0 : null, isNew: current > 0 };
  return { pct: ((current - previous) / previous) * 100, isNew: false };
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function referrerLabel(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("facebook")) return "Facebook";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("twitter") || host.includes("x.com")) return "Twitter / X";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("tiktok")) return "TikTok";
    return host;
  } catch {
    return "Direct";
  }
}

const EMPTY_ANALYTICS: AnalyticsOverview = {
  viewsLast30Days: 0,
  viewsLast30DaysTrend: { pct: null, isNew: false },
  uniqueVisitors: null,
  uniqueVisitorsTrend: { pct: null, isNew: false },
  bounceRate: null,
  bounceRateTrend: { pct: null, isNew: false },
  avgTimeOnPageSeconds: null,
  avgTimeOnPageTrend: { pct: null, isNew: false },
  dailyViews: [],
  topReferrers: [],
  topPages: [],
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  if (!isSupabaseConfigured) return EMPTY_ANALYTICS;

  const supabase = await createClient();
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("page_views")
    .select("path, referrer, session_id, duration_seconds, created_at")
    .gte("created_at", sixtyDaysAgo.toISOString());

  if (error || !data) {
    if (error?.code === "42703") {
      console.warn(
        "page_views is missing the analytics columns — run the updated supabase/analytics.sql against your Supabase project."
      );
    } else if (error) {
      console.error("Failed to load analytics overview from Supabase:", error.message);
    }
    return EMPTY_ANALYTICS;
  }

  const rows = data as Pick<PageViewRow, "path" | "referrer" | "session_id" | "duration_seconds" | "created_at">[];
  const last30 = rows.filter((r) => r.created_at >= thirtyDaysAgo.toISOString());
  const prev30 = rows.filter((r) => r.created_at < thirtyDaysAgo.toISOString());

  // Daily views for the last 30 days, zero-filled. Grouped by unique session
  // per day so a visitor reloading the page repeatedly counts once, not once
  // per reload.
  const rowsByDay = new Map<string, { session_id: string | null }[]>();
  for (const row of last30) {
    const key = toDateKey(row.created_at);
    if (!rowsByDay.has(key)) rowsByDay.set(key, []);
    rowsByDay.get(key)!.push(row);
  }
  const dailyViews: DailyViewPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyViews.push({ date: key, count: countUniqueSessions(rowsByDay.get(key) ?? []) });
  }

  // Unique visitors — only meaningful once session_id is being sent.
  const sessionsThisPeriod = new Set(last30.map((r) => r.session_id).filter((s): s is string => Boolean(s)));
  const sessionsPrevPeriod = new Set(prev30.map((r) => r.session_id).filter((s): s is string => Boolean(s)));
  const hasSessionData = sessionsThisPeriod.size > 0 || sessionsPrevPeriod.size > 0;

  // Bounce rate — share of sessions with exactly one page view.
  let bounceRate: number | null = null;
  let bounceRateTrend: Trend = { pct: null, isNew: false };
  if (hasSessionData) {
    const viewsPerSession = (rowsInPeriod: typeof rows) => {
      const counts = new Map<string, number>();
      for (const r of rowsInPeriod) {
        if (!r.session_id) continue;
        counts.set(r.session_id, (counts.get(r.session_id) ?? 0) + 1);
      }
      return counts;
    };
    const rate = (rowsInPeriod: typeof rows) => {
      const counts = viewsPerSession(rowsInPeriod);
      if (counts.size === 0) return null;
      const bounced = [...counts.values()].filter((n) => n === 1).length;
      return (bounced / counts.size) * 100;
    };
    bounceRate = rate(last30);
    const prevBounceRate = rate(prev30);
    if (bounceRate !== null && prevBounceRate !== null) {
      bounceRateTrend = computeTrend(bounceRate, prevBounceRate);
    }
  }

  // Average time on page — only meaningful once duration_seconds is being sent.
  const durations = (rowsInPeriod: typeof rows) => rowsInPeriod.map((r) => r.duration_seconds).filter((d): d is number => d != null);
  const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);
  const avgTimeOnPageSeconds = avg(durations(last30));
  const prevAvgTimeOnPageSeconds = avg(durations(prev30));
  const avgTimeOnPageTrend: Trend =
    avgTimeOnPageSeconds !== null && prevAvgTimeOnPageSeconds !== null
      ? computeTrend(avgTimeOnPageSeconds, prevAvgTimeOnPageSeconds)
      : { pct: null, isNew: false };

  // Top referrers and top pages, last 30 days.
  const referrerCounts = new Map<string, number>();
  for (const row of last30) {
    const label = referrerLabel(row.referrer);
    referrerCounts.set(label, (referrerCounts.get(label) ?? 0) + 1);
  }
  const topReferrers = [...referrerCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const pageCounts = new Map<string, number>();
  for (const row of last30) {
    pageCounts.set(row.path, (pageCounts.get(row.path) ?? 0) + 1);
  }
  const topPages = [...pageCounts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const viewsLast30Days = countUniqueSessions(last30);
  const viewsPrev30Days = countUniqueSessions(prev30);

  return {
    viewsLast30Days,
    viewsLast30DaysTrend: computeTrend(viewsLast30Days, viewsPrev30Days),
    uniqueVisitors: hasSessionData ? sessionsThisPeriod.size : null,
    uniqueVisitorsTrend: hasSessionData ? computeTrend(sessionsThisPeriod.size, sessionsPrevPeriod.size) : { pct: null, isNew: false },
    bounceRate,
    bounceRateTrend,
    avgTimeOnPageSeconds,
    avgTimeOnPageTrend,
    dailyViews,
    topReferrers,
    topPages,
  };
}
