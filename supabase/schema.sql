-- Arnold B. Fadriquila Real Estate Portfolio — Supabase schema
-- Run this once against a fresh Supabase project (SQL Editor, or `supabase db push`).
-- Assumes a single admin account created via Supabase Auth (email/password) — any
-- authenticated session is treated as the admin for write access (Phase 3).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  property_type text not null check (
    property_type in ('House & Lot', 'Condominium', 'Townhouse', 'Lot & Land', 'Bungalow', 'Single Attached')
  ),
  region text not null check (region in ('Luzon', 'Visayas', 'Mindanao')),
  province text not null,
  city text not null,
  price numeric not null check (price >= 0),
  bedrooms integer,
  bathrooms integer,
  lot_area numeric,
  floor_area numeric,
  status text not null default 'RFO' check (status in ('RFO', 'Pre-selling', 'Accept Reservation')),
  featured boolean not null default false,
  features text[] not null default '{}',
  amenities text[] not null default '{}',
  nearby_locations text[] not null default '{}',
  listing_type text,
  condition text,
  house_type text,
  floors integer,
  car_parking_spaces integer,
  developer text,
  subdivision text,
  property_address text,
  created_at timestamptz not null default now()
);

-- Added for the "Post my listing" quick-entry / AI autofill wizard. Idempotent
-- so this script can be re-run against a deployment created before these
-- columns existed.
alter table properties add column if not exists listing_type text;
-- Listing type became optional (N/A selectable) — drop any existing NOT NULL/default.
alter table properties alter column listing_type drop not null;
alter table properties alter column listing_type drop default;
alter table properties add column if not exists condition text;
alter table properties add column if not exists house_type text;
alter table properties add column if not exists floors integer;
alter table properties add column if not exists car_parking_spaces integer;
alter table properties add column if not exists developer text;
alter table properties add column if not exists subdivision text;
alter table properties add column if not exists property_address text;

alter table properties drop constraint if exists properties_listing_type_check;
alter table properties add constraint properties_listing_type_check
  check (listing_type is null or listing_type in ('For Sale', 'For Rent/Lease', 'Pasalo'));

alter table properties drop constraint if exists properties_condition_check;
alter table properties add constraint properties_condition_check
  check (condition is null or condition in ('New', 'Pre-owned'));

-- Migrate an existing deployment's status values/constraint to the new labels.
-- Drop the old constraint first — it still only allows the old labels, so
-- updating rows to the new labels while it's active would fail.
alter table properties drop constraint if exists properties_status_check;
update properties set status = 'RFO' where status = 'Available';
update properties set status = 'Accept Reservation' where status = 'Reserved';
update properties set status = 'Pre-selling' where status = 'Sold';
alter table properties add constraint properties_status_check
  check (status in ('RFO', 'Pre-selling', 'Accept Reservation'));
alter table properties alter column status set default 'RFO';

-- ---------------------------------------------------------------------------
-- property_images
-- ---------------------------------------------------------------------------
create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists property_images_property_id_idx on property_images(property_id);

-- ---------------------------------------------------------------------------
-- inquiries
-- ---------------------------------------------------------------------------
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  property_id uuid references properties(id) on delete set null,
  preferred_property text,
  preferred_location text,
  budget text,
  message text,
  status text not null default 'New' check (status in ('New', 'Contacted', 'In Progress', 'Closed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- viewing_requests
-- ---------------------------------------------------------------------------
create table if not exists viewing_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  property_id uuid references properties(id) on delete set null,
  property_text text,
  preferred_date date not null,
  preferred_time time not null,
  message text,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  rating smallint not null default 5,
  message text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- Add the columns if the table already existed from a prior run of this script.
alter table testimonials add column if not exists location text;
alter table testimonials add column if not exists rating smallint not null default 5;

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  source text,
  status text not null default 'Lead' check (status in ('Lead', 'Contacted', 'Active', 'Closed')),
  notes text,
  next_follow_up date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- deals
-- ---------------------------------------------------------------------------
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  property_title text not null,
  stage text not null default 'Offer' check (
    stage in ('Offer', 'Reservation', 'Financing', 'Closing', 'Completed', 'Cancelled')
  ),
  amount numeric,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- conversations / messages (Arnold's Assistant chat widget, logged from n8n)
-- ---------------------------------------------------------------------------
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  contact_name text,
  contact_email text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  human_takeover boolean not null default false
);

-- Lets the dashboard flag a conversation so the n8n bot stops auto-replying
-- once Arnold has taken over (added after the initial conversations rollout).
alter table conversations add column if not exists human_takeover boolean not null default false;

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'admin')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists conversations_last_message_at_idx on conversations(last_message_at desc);

-- Migrate an existing deployment's role constraint to also allow 'admin'
-- (dashboard-authored replies), added after the initial conversations/messages rollout.
alter table messages drop constraint if exists messages_role_check;
alter table messages add constraint messages_role_check check (role in ('user', 'assistant', 'admin'));

-- ---------------------------------------------------------------------------
-- site_settings (single row, id = 'default')
-- ---------------------------------------------------------------------------
create table if not exists site_settings (
  id text primary key default 'default',
  phone text not null default '',
  email text not null default '',
  facebook text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  youtube text not null default '',
  notify_on_inquiry boolean not null default true,
  notify_on_viewing boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table properties enable row level security;
alter table property_images enable row level security;
alter table inquiries enable row level security;
alter table viewing_requests enable row level security;
alter table testimonials enable row level security;
alter table clients enable row level security;
alter table deals enable row level security;
alter table site_settings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- properties: public read, admin (authenticated) write
drop policy if exists "properties_public_read" on properties;
drop policy if exists "properties_admin_insert" on properties;
drop policy if exists "properties_admin_update" on properties;
drop policy if exists "properties_admin_delete" on properties;
create policy "properties_public_read" on properties for select using (true);
create policy "properties_admin_insert" on properties for insert to authenticated with check (true);
create policy "properties_admin_update" on properties for update to authenticated using (true) with check (true);
create policy "properties_admin_delete" on properties for delete to authenticated using (true);

-- property_images: public read, admin write
drop policy if exists "property_images_public_read" on property_images;
drop policy if exists "property_images_admin_insert" on property_images;
drop policy if exists "property_images_admin_update" on property_images;
drop policy if exists "property_images_admin_delete" on property_images;
create policy "property_images_public_read" on property_images for select using (true);
create policy "property_images_admin_insert" on property_images for insert to authenticated with check (true);
create policy "property_images_admin_update" on property_images for update to authenticated using (true) with check (true);
create policy "property_images_admin_delete" on property_images for delete to authenticated using (true);

-- inquiries: anyone can submit, only admin can read/manage
drop policy if exists "inquiries_public_insert" on inquiries;
drop policy if exists "inquiries_admin_select" on inquiries;
drop policy if exists "inquiries_admin_update" on inquiries;
drop policy if exists "inquiries_admin_delete" on inquiries;
create policy "inquiries_public_insert" on inquiries for insert to anon, authenticated with check (true);
create policy "inquiries_admin_select" on inquiries for select to authenticated using (true);
create policy "inquiries_admin_update" on inquiries for update to authenticated using (true) with check (true);
create policy "inquiries_admin_delete" on inquiries for delete to authenticated using (true);

-- viewing_requests: anyone can submit, only admin can read/manage
drop policy if exists "viewing_requests_public_insert" on viewing_requests;
drop policy if exists "viewing_requests_admin_select" on viewing_requests;
drop policy if exists "viewing_requests_admin_update" on viewing_requests;
drop policy if exists "viewing_requests_admin_delete" on viewing_requests;
create policy "viewing_requests_public_insert" on viewing_requests for insert to anon, authenticated with check (true);
create policy "viewing_requests_admin_select" on viewing_requests for select to authenticated using (true);
create policy "viewing_requests_admin_update" on viewing_requests for update to authenticated using (true) with check (true);
create policy "viewing_requests_admin_delete" on viewing_requests for delete to authenticated using (true);

-- testimonials: public read of enabled rows, admin reads/writes everything
drop policy if exists "testimonials_public_read_enabled" on testimonials;
drop policy if exists "testimonials_admin_read_all" on testimonials;
drop policy if exists "testimonials_admin_insert" on testimonials;
drop policy if exists "testimonials_admin_update" on testimonials;
drop policy if exists "testimonials_admin_delete" on testimonials;
create policy "testimonials_public_read_enabled" on testimonials for select to anon using (enabled = true);
create policy "testimonials_admin_read_all" on testimonials for select to authenticated using (true);
create policy "testimonials_admin_insert" on testimonials for insert to authenticated with check (true);
create policy "testimonials_admin_update" on testimonials for update to authenticated using (true) with check (true);
create policy "testimonials_admin_delete" on testimonials for delete to authenticated using (true);

-- clients, deals, site_settings: admin-only, no public access
drop policy if exists "clients_admin_select" on clients;
drop policy if exists "clients_admin_insert" on clients;
drop policy if exists "clients_admin_update" on clients;
drop policy if exists "clients_admin_delete" on clients;
create policy "clients_admin_select" on clients for select to authenticated using (true);
create policy "clients_admin_insert" on clients for insert to authenticated with check (true);
create policy "clients_admin_update" on clients for update to authenticated using (true) with check (true);
create policy "clients_admin_delete" on clients for delete to authenticated using (true);

drop policy if exists "deals_admin_select" on deals;
drop policy if exists "deals_admin_insert" on deals;
drop policy if exists "deals_admin_update" on deals;
drop policy if exists "deals_admin_delete" on deals;
create policy "deals_admin_select" on deals for select to authenticated using (true);
create policy "deals_admin_insert" on deals for insert to authenticated with check (true);
create policy "deals_admin_update" on deals for update to authenticated using (true) with check (true);
create policy "deals_admin_delete" on deals for delete to authenticated using (true);

drop policy if exists "site_settings_admin_select" on site_settings;
drop policy if exists "site_settings_admin_insert" on site_settings;
drop policy if exists "site_settings_admin_update" on site_settings;
create policy "site_settings_admin_select" on site_settings for select to authenticated using (true);
create policy "site_settings_admin_insert" on site_settings for insert to authenticated with check (true);
create policy "site_settings_admin_update" on site_settings for update to authenticated using (true) with check (true);

-- conversations, messages: admin-only read; writes come only from the n8n
-- workflow using the Supabase service-role key, which bypasses RLS entirely —
-- no anon/authenticated insert policy is needed or granted.
drop policy if exists "conversations_admin_select" on conversations;
drop policy if exists "conversations_admin_delete" on conversations;
drop policy if exists "conversations_admin_update" on conversations;
create policy "conversations_admin_select" on conversations for select to authenticated using (true);
create policy "conversations_admin_delete" on conversations for delete to authenticated using (true);
-- Lets the dashboard toggle human_takeover (pause/resume the bot).
create policy "conversations_admin_update" on conversations for update to authenticated using (true) with check (true);

drop policy if exists "messages_admin_select" on messages;
drop policy if exists "messages_admin_insert" on messages;
create policy "messages_admin_select" on messages for select to authenticated using (true);
-- Lets the dashboard send admin replies into a conversation; the chat widget's
-- polling endpoint reads them back using the service-role key (bypasses RLS).
create policy "messages_admin_insert" on messages for insert to authenticated with check (role = 'admin');
