-- One-shot RLS repair: force-drops every existing policy on these tables
-- (regardless of name, catching any stray/duplicate ones from earlier runs)
-- and recreates the intended clean set. Safe to run any number of times.

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where tablename in ('properties', 'property_images', 'inquiries', 'viewing_requests', 'testimonials', 'page_views')
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- properties: public read, admin (authenticated) write
create policy "properties_public_read" on properties for select using (true);
create policy "properties_admin_insert" on properties for insert to authenticated with check (true);
create policy "properties_admin_update" on properties for update to authenticated using (true) with check (true);
create policy "properties_admin_delete" on properties for delete to authenticated using (true);

-- property_images: public read, admin write
create policy "property_images_public_read" on property_images for select using (true);
create policy "property_images_admin_insert" on property_images for insert to authenticated with check (true);
create policy "property_images_admin_update" on property_images for update to authenticated using (true) with check (true);
create policy "property_images_admin_delete" on property_images for delete to authenticated using (true);

-- inquiries: anyone can submit, only admin can read/manage
create policy "inquiries_public_insert" on inquiries for insert to anon, authenticated with check (true);
create policy "inquiries_admin_select" on inquiries for select to authenticated using (true);
create policy "inquiries_admin_update" on inquiries for update to authenticated using (true) with check (true);
create policy "inquiries_admin_delete" on inquiries for delete to authenticated using (true);

-- viewing_requests: anyone can submit, only admin can read/manage
create policy "viewing_requests_public_insert" on viewing_requests for insert to anon, authenticated with check (true);
create policy "viewing_requests_admin_select" on viewing_requests for select to authenticated using (true);
create policy "viewing_requests_admin_update" on viewing_requests for update to authenticated using (true) with check (true);
create policy "viewing_requests_admin_delete" on viewing_requests for delete to authenticated using (true);

-- testimonials: public read of enabled rows, admin reads/writes everything
create policy "testimonials_public_read_enabled" on testimonials for select to anon using (enabled = true);
create policy "testimonials_admin_read_all" on testimonials for select to authenticated using (true);
create policy "testimonials_admin_insert" on testimonials for insert to authenticated with check (true);
create policy "testimonials_admin_update" on testimonials for update to authenticated using (true) with check (true);
create policy "testimonials_admin_delete" on testimonials for delete to authenticated using (true);

-- page_views: anyone can record a visit, only admin can read the log
create policy "page_views_public_insert" on page_views for insert to anon, authenticated with check (true);
create policy "page_views_admin_select" on page_views for select to authenticated using (true);

-- Also make sure RLS isn't forced (which would apply policies even to the table owner) —
-- not expected to be on, but harmless to state explicitly.
alter table properties no force row level security;
alter table property_images no force row level security;
alter table inquiries no force row level security;
alter table viewing_requests no force row level security;
alter table testimonials no force row level security;
alter table page_views no force row level security;
