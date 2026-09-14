-- Storage bucket for property images uploaded via the admin dashboard.
-- Run once in the SQL Editor (safe to re-run — idempotent, same pattern as schema.sql).

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "property_images_bucket_public_read" on storage.objects;
drop policy if exists "property_images_bucket_admin_insert" on storage.objects;
drop policy if exists "property_images_bucket_admin_update" on storage.objects;
drop policy if exists "property_images_bucket_admin_delete" on storage.objects;

create policy "property_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "property_images_bucket_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images');

create policy "property_images_bucket_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images')
  with check (bucket_id = 'property-images');

create policy "property_images_bucket_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images');
