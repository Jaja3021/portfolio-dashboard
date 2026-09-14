// The public marketing site this dashboard manages. Set NEXT_PUBLIC_PORTFOLIO_URL
// once the portfolio site has a real domain — until then this falls back to the
// local dev port so "View Site" still works when running both projects locally.
export const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL || "http://localhost:3000";
