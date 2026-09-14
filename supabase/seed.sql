-- Optional seed data matching the Phase 1 mock catalog, so a freshly connected
-- Supabase project shows the same listings the site was designed against.
-- Run after schema.sql. Safe to skip or edit before running.

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Modern Family Home',
    'A bright, modern family home with clean architectural lines, a landscaped garden, and a private driveway — designed for comfortable everyday living.',
    'House & Lot', 'Luzon', 'Cavite', 'Dasmariñas', 5800000, 3, 2, 120, 85, 'RFO', true,
    array['Two-car garage', 'Landscaped garden', 'Covered porch', 'Maid''s room'],
    array['Gated subdivision', '24/7 security', 'Clubhouse access'],
    array['SM Dasmariñas', 'De La Salle University Dasmariñas', 'CAVITEX access'],
    '2026-06-01'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Skyline Residences Unit',
    'A well-appointed condominium unit ideal for city living or as a rental investment, with easy access to major business districts.',
    'Condominium', 'Luzon', 'Metro Manila', 'Taguig', 8200000, 2, 1, null, 52, 'RFO', true,
    array['Balcony', 'Floor-to-ceiling windows', 'Parking slot included'],
    array['Swimming pool', 'Fitness center', '24/7 concierge'],
    array['Bonifacio Global City', 'SM Aura', 'Market! Market!'],
    '2026-05-20'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580216643062-cf460548a66a?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Greenview Townhouse',
    'A practical and affordable townhouse in a quiet, established community — a solid option for growing families.',
    'Townhouse', 'Luzon', 'Laguna', 'Santa Rosa', 4200000, 3, 2, 60, 70, 'RFO', true,
    array['Private carport', 'Balcony', 'Provision for aircon'],
    array['Community park', 'Perimeter fence', 'Guarded entrance'],
    array['Nuvali', 'Santa Rosa exit', 'Paseo de Santa Rosa'],
    '2026-05-10'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Riverside Residential Lot',
    'A quiet residential lot suited for a custom-built home or long-term land investment.',
    'Lot & Land', 'Luzon', 'Batangas', 'Lipa', 2500000, null, null, 300, null, 'RFO', false,
    array['Corner lot', 'Titled property', 'Road access'],
    array['Near main highway'],
    array['Lipa City proper', 'STAR Tollway'],
    '2026-04-28'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Downtown Commercial Space',
    'A versatile commercial space suited for retail, office, or business use in a high-traffic area.',
    'Commercial', 'Visayas', 'Cebu', 'Cebu City', 12500000, null, 2, 150, 200, 'RFO', true,
    array['Ground floor frontage', 'Ample parking', 'High foot traffic'],
    array['Near business district'],
    array['Ayala Center Cebu', 'Cebu IT Park'],
    '2026-06-10'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Highland Single Attached Home',
    'A single-attached home offering more privacy than a townhouse at a practical price point, set in a growing highland community.',
    'Single Attached', 'Mindanao', 'Bukidnon', 'Malaybalay', 3600000, 3, 2, 90, 72, 'RFO', false,
    array['Private side yard', 'Carport', 'One shared wall'],
    array['Road access', 'Near town proper'],
    array['Malaybalay City proper'],
    '2026-03-15'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Seaside Bungalow',
    'A cozy single-storey home a short drive from the coast, ideal as a primary residence or vacation property.',
    'House & Lot', 'Visayas', 'Iloilo', 'Iloilo City', 3900000, 2, 1, 100, 65, 'Accept Reservation', false,
    array['Garden space', 'Covered patio'],
    array['Near coastal road'],
    array['Iloilo Business Park'],
    '2026-02-22'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Uptown Condo Suite',
    'A compact, efficient condo suite well-suited to young professionals or investors.',
    'Condominium', 'Mindanao', 'Davao', 'Davao City', 3400000, 1, 1, null, 30, 'RFO', true,
    array['City view', 'Built-in cabinetry'],
    array['Rooftop deck', 'Function room'],
    array['Abreeza Mall', 'Davao International Airport'],
    '2026-06-18'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580216643062-cf460548a66a?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Parkview Family Townhouse',
    'A modern townhouse unit close to schools and commercial centers.',
    'Townhouse', 'Luzon', 'Rizal', 'Antipolo', 4800000, 3, 2, 65, 78, 'RFO', false,
    array['Balcony', 'Carport'],
    array['Playground', 'Guarded entrance'],
    array['Robinsons Antipolo', 'Antipolo Cathedral'],
    '2026-05-02'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Executive Family Estate',
    'A spacious executive home with generous outdoor space, suited for large families.',
    'House & Lot', 'Luzon', 'Pampanga', 'Angeles', 9500000, 4, 3, 200, 180, 'RFO', false,
    array['Two-car garage', 'Home office space', 'Landscaped garden'],
    array['Gated community', 'Clubhouse', 'Swimming pool access'],
    array['Clark Freeport Zone', 'SM City Clark'],
    '2026-04-05'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Investment Lot Near Highway',
    'A strategically located lot suited for commercial or investment purposes.',
    'Lot & Land', 'Visayas', 'Bacolod', 'Bacolod City', 1800000, null, null, 250, null, 'Pre-selling', false,
    array['Titled property', 'Level terrain'],
    array[]::text[],
    array['Bacolod-Silay Highway'],
    '2026-01-30'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop'
]) as url;

with p as (
  insert into properties (title, description, property_type, region, province, city, price, bedrooms, bathrooms, lot_area, floor_area, status, featured, features, amenities, nearby_locations, created_at)
  values (
    'Cabanatuan Single Attached Home',
    'A compact single-attached home in a developing residential corridor, well suited for first-time buyers.',
    'Single Attached', 'Luzon', 'Nueva Ecija', 'Cabanatuan', 2800000, 2, 1, 70, 55, 'RFO', false,
    array['Provision for carport', 'One shared wall'],
    array['Near main road'],
    array['Cabanatuan City proper'],
    '2026-03-01'
  ) returning id
)
insert into property_images (property_id, image_url)
select id, url from p, unnest(array[
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80&auto=format&fit=crop'
]) as url;

insert into testimonials (name, location, rating, message, enabled) values
  ('The Dela Cruz Family', 'Liora Homes, Naic', 5, 'Arnold made the entire process so easy. He explained everything clearly — from Pag-IBIG requirements to monthly amortization. Now we have our own home in Liora!', true),
  ('Mark & Jen Villamor', 'Pagsibol Village, Pampanga', 5, 'What we love about Arnold is he''s not just an agent — he genuinely cares. He followed up on our application and even checked in with us during turnover.', true),
  ('Jomari Salazar', 'Masaito Homes, Imus', 5, 'I discovered Arnold through his property listings online. His content and follow-through convinced us Masaito Homes was the right developer for our family.', true);
