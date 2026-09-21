-- Clears all live data EXCEPT properties, property_images, testimonials, and
-- site_settings. Run manually in the Supabase SQL Editor when you want to
-- reset the dashboard to a clean slate.
--
-- messages are removed automatically via the conversations foreign key
-- (on delete cascade), so they don't need their own delete statement, but
-- it's included explicitly for clarity/safety.

delete from messages;
delete from conversations;
delete from deals;
delete from clients;
delete from viewing_requests;
delete from inquiries;
delete from page_views;
