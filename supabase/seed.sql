-- Seeds the exact catalog/locations that shipped as lib/data.ts mock data,
-- so the storefront looks identical after switching to real reads.

insert into categories (name, slug, sort_order) values
  ('Classic Cakes', 'classic-cakes', 1),
  ('Bento Cakes', 'bento-cakes', 2),
  ('Designer Cakes', 'designer-cakes', 3),
  ('Theme Cakes', 'theme-cakes', 4),
  ('Photo Cakes', 'photo-cakes', 5),
  ('Heart Cakes', 'heart-cakes', 6),
  ('Pinata Cakes', 'pinata-cakes', 7),
  ('Pull Me Up Cakes', 'pull-me-up-cakes', 8),
  ('Drip Cakes', 'drip-cakes', 9),
  ('Cheesecakes', 'cheesecakes', 10),
  ('Half Cakes', 'half-cakes', 11),
  ('Gourmet Cakes', 'gourmet-cakes', 12)
on conflict (slug) do nothing;

with p as (
  insert into products (slug, sku, name, description, category, base_price, sale_price, default_weight, flavors, eggless_available, eggless_price_premium, stock, images, ingredients, allergens, shelf_life, bestseller, rating, review_count, delivery_eligibility)
  values
    ('classic-belgian-truffle', 'CB-001', 'Classic Belgian Truffle', 'A rich, dark chocolate truffle cake layered with premium Belgian chocolate ganache.', 'Classic Cakes', 649, 599, '0.5 kg', '{Chocolate}', true, 50, 20, '{https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=85}', '{Flour,Sugar,"Cocoa Powder","Belgian Chocolate",Cream}', '{Dairy,Gluten,Soy}', '3 Days', true, 4.9, 342, '{60-min,same-day,midnight,fixed-time}'),
    ('midnight-red-velvet', 'RV-002', 'Midnight Red Velvet', 'Soft, buttery red velvet sponge layered with smooth cream cheese frosting.', 'Classic Cakes', 749, null, '0.5 kg', '{"Red Velvet"}', true, 50, 15, '{https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&q=85}', '{Flour,Sugar,"Cocoa Powder","Cream Cheese",Butter}', '{Dairy,Gluten}', '3 Days', true, 4.8, 256, '{same-day,midnight,fixed-time}'),
    ('pistachio-rasmalai-cake', 'RC-003', 'Pistachio Rasmalai Cake', 'A fusion delight. Cardamom sponge soaked in saffron milk, layered with fresh rasmalai and pistachios.', 'Gourmet Cakes', 799, null, '0.5 kg', '{Rasmalai}', true, 100, 10, '{https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=85}', '{Flour,Sugar,Milk,Cardamom,Saffron,Pistachios}', '{Dairy,Gluten,Nuts}', '2 Days', true, 4.9, 412, '{same-day,fixed-time}'),
    ('chocolate-biscoff-crunch', 'CB-004', 'Chocolate Biscoff Crunch', 'Chocolate sponge with Lotus Biscoff spread, crushed cookies, and a caramel drip.', 'Classic Cakes', 699, null, '0.5 kg', '{Biscoff,Chocolate}', true, 50, 25, '{https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=85}', '{Flour,Sugar,"Cocoa Powder","Biscoff Spread",Cream}', '{Dairy,Gluten,Soy}', '3 Days', false, 4.7, 120, '{60-min,same-day,midnight,fixed-time}'),
    ('fresh-strawberry-cloud', 'FS-005', 'Fresh Strawberry Cloud', 'Light vanilla sponge filled with fresh strawberry compote and whipped cream.', 'Classic Cakes', 649, null, '0.5 kg', '{Strawberry,Vanilla}', true, 50, 15, '{https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=85}', '{Flour,Sugar,"Fresh Strawberries",Cream}', '{Dairy,Gluten}', '2 Days', false, 4.6, 89, '{same-day,fixed-time}')
  returning id, slug
)
insert into product_variants (product_id, weight, price_multiplier, serves, sort_order)
select p.id, v.weight, v.mult, v.serves, v.ord
from p
join (values
  ('classic-belgian-truffle', '0.5 kg', 1.0, '4-5', 1),
  ('classic-belgian-truffle', '1 kg', 1.8, '8-10', 2),
  ('classic-belgian-truffle', '1.5 kg', 2.7, '12-15', 3),
  ('classic-belgian-truffle', '2 kg', 3.5, '16-20', 4),
  ('midnight-red-velvet', '0.5 kg', 1.0, '4-5', 1),
  ('midnight-red-velvet', '1 kg', 1.8, '8-10', 2),
  ('pistachio-rasmalai-cake', '0.5 kg', 1.0, '4-5', 1),
  ('pistachio-rasmalai-cake', '1 kg', 1.8, '8-10', 2),
  ('pistachio-rasmalai-cake', '1.5 kg', 2.7, '12-15', 3),
  ('chocolate-biscoff-crunch', '0.5 kg', 1.0, '4-5', 1),
  ('chocolate-biscoff-crunch', '1 kg', 1.8, '8-10', 2),
  ('fresh-strawberry-cloud', '0.5 kg', 1.0, '4-5', 1),
  ('fresh-strawberry-cloud', '1 kg', 1.8, '8-10', 2)
) as v(slug, weight, mult, serves, ord) on v.slug = p.slug;

with l as (
  insert into locations (city, state) values
    ('Delhi NCR', 'Delhi'),
    ('Mumbai', 'Maharashtra'),
    ('Bangalore', 'Karnataka'),
    ('Hyderabad', 'Telangana')
  returning id, city
)
insert into delivery_zones (location_id, pincode, delivery_fee, same_day_available, sixty_minute_available, midnight_available, fixed_time_available)
select l.id, z.pincode, z.fee, true, z.sixty, true, true
from l
join (values
  ('Delhi NCR', '110001', 0, true), ('Delhi NCR', '110002', 0, true), ('Delhi NCR', '110003', 0, true), ('Delhi NCR', '122001', 0, true), ('Delhi NCR', '201301', 0, true),
  ('Mumbai', '400001', 0, false), ('Mumbai', '400002', 0, false), ('Mumbai', '400003', 0, false),
  ('Bangalore', '560001', 0, true), ('Bangalore', '560002', 0, true), ('Bangalore', '560003', 0, true),
  ('Hyderabad', '500001', 0, false), ('Hyderabad', '500002', 0, false)
) as z(city, pincode, fee, sixty) on z.city = l.city;
