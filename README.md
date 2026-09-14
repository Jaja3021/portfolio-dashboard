# Portfolio Dashboard

The admin dashboard for [Arnold B. Fadriquila, RES](../portfolio) — property, client, deal,
inquiry, and viewing-request management. Extracted from the main portfolio site so it can be
developed and deployed independently.

## How this relates to `portfolio/`

This is **not** a frontend calling a separate backend API. Both this app and the public
`portfolio/` site connect **directly to the same Supabase project** (the real backend — database,
auth, and file storage) using their own copies of the Supabase client code. Neither app calls the
other over HTTP. This mirrors the `herbies` / `herbies-dashboard` split already used elsewhere in
this workspace.

Because of that, most files here were **copied**, not proxied — `src/lib/data.ts`,
`src/lib/supabase/*`, and the `supabase/*.sql` schema/policies exist in both projects. If you
change the database schema or RLS policies, update `supabase/*.sql` in **both** places (or better,
treat this project's copy as the source of truth for schema changes, since only the dashboard
writes data that the schema needs to protect).

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values below
npm run dev                  # runs on http://localhost:3002
```

### Environment variables

| Variable                        | Where to find it                                                       |
| ------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Same value as `portfolio/.env.local` — Supabase Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same value as `portfolio/.env.local`                                   |
| `NEXT_PUBLIC_PORTFOLIO_URL`     | The public site's URL (used only for the sidebar's "View Site" link)   |

This app never needs `SUPABASE_SERVICE_ROLE_KEY` — every admin read/write goes through the
Supabase browser SDK as the signed-in admin user, protected by Row Level Security policies (see
`supabase/fix-rls.sql`), not a service-role bypass.

### Creating an admin user

Sign-in is Supabase Auth (email + password). Create a user in the Supabase dashboard under
**Authentication → Users** — there's no self-service signup page by design.

## Structure

```
src/
  app/
    login/           Sign-in page
    dashboard/        Overview, properties, clients, deals, inquiries,
                       viewing requests, calendar, testimonials, settings
  components/
    admin/            All dashboard UI (sidebar, managers, forms)
    ui/                Shared Button / Modal / Badge / FormField
  lib/
    data.ts            Server-side Supabase reads for every dashboard page
    supabase/          Browser + server Supabase clients, session middleware
  proxy.ts             Route guard — redirects signed-out visitors to /login
supabase/              Schema, seed data, RLS policies, storage config (SQL)
```

## Deploying separately from the portfolio site

This runs as its own Next.js app, so it deploys independently (its own Vercel project, its own
domain — e.g. `dashboard.yourdomain.com`). It shares the Supabase project with `portfolio/` but
has no build-time or runtime dependency on it, other than the "View Site" link.
