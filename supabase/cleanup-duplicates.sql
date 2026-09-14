-- One-time cleanup for duplicate rows left by running seed.sql more than once.
-- Keeps the oldest row per duplicate title/message and deletes the rest
-- (property_images cascade-delete automatically with their property).
-- Safe to run multiple times — it's a no-op once duplicates are gone.

delete from properties p
using (
  select id, row_number() over (partition by title order by created_at asc, id asc) as rn
  from properties
) dup
where p.id = dup.id and dup.rn > 1;

delete from testimonials t
using (
  select id, row_number() over (partition by name, message order by created_at asc, id asc) as rn
  from testimonials
) dup
where t.id = dup.id and dup.rn > 1;
