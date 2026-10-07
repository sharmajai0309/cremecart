-- Demo/dummy data: fills out the empty categories with real catalog
-- products, adds a spread of orders across every status, and leaves
-- reviews on delivered items so ratings and the homepage testimonials
-- section have real content to show. Safe to re-run (ON CONFLICT guards).

-- ============================================================
-- PRODUCTS
-- ============================================================

with p as (
  insert into products (slug, sku, name, description, category, base_price, sale_price, default_weight, flavors, eggless_available, eggless_price_premium, stock, images, ingredients, allergens, shelf_life, bestseller, rating, review_count, delivery_eligibility)
  values
    ('mini-love-bento', 'BT-006', 'Mini Love Bento', 'A petite, personal-sized bento cake with a sweet handwritten note card — perfect for a solo celebration.', 'Bento Cakes', 449, null, '0.25 kg', '{Vanilla,Strawberry}', true, 30, 18, '{https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=800&q=85}', '{Flour,Sugar,Cream,"Fresh Strawberries"}', '{Dairy,Gluten}', '2 Days', false, 0, 0, '{60-min,same-day,fixed-time}'),
    ('rose-gold-elegance', 'DC-007', 'Rose Gold Elegance', 'A show-stopping designer cake finished with edible gold leaf and delicate sugar roses.', 'Designer Cakes', 1899, 1699, '1 kg', '{Vanilla,Chocolate}', true, 100, 8, '{https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=85}', '{Flour,Sugar,Butter,"Edible Gold Leaf",Fondant}', '{Dairy,Gluten,Eggs}', '3 Days', true, 0, 0, '{same-day,fixed-time}'),
    ('superhero-blast', 'TC-008', 'Superhero Blast Theme Cake', 'A vibrant theme cake with a printed edible topper, built for the littlest superhero fans.', 'Theme Cakes', 999, null, '1 kg', '{Chocolate,Butterscotch}', true, 75, 12, '{https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&q=85}', '{Flour,Sugar,"Cocoa Powder",Butter,"Edible Print"}', '{Dairy,Gluten}', '2 Days', false, 0, 0, '{same-day,fixed-time}'),
    ('classic-photo-cake', 'PC-009', 'Classic Photo Cake', 'Your favourite memory, printed in edible ink on a soft vanilla sponge. Upload your own photo at checkout.', 'Photo Cakes', 799, null, '0.5 kg', '{Vanilla,Chocolate}', true, 50, 15, '{https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=800&q=85}', '{Flour,Sugar,Cream,"Edible Print"}', '{Dairy,Gluten}', '2 Days', true, 0, 0, '{60-min,same-day,fixed-time}'),
    ('heartfelt-red-velvet', 'HC-010', 'Heartfelt Red Velvet', 'A heart-shaped red velvet cake layered with cream cheese frosting — made for the ones who matter most.', 'Heart Cakes', 849, 749, '1 kg', '{"Red Velvet"}', true, 50, 10, '{https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=800&q=85}', '{Flour,Sugar,"Cocoa Powder","Cream Cheese",Butter}', '{Dairy,Gluten}', '3 Days', true, 0, 0, '{same-day,midnight,fixed-time}'),
    ('surprise-pinata-pop', 'PT-011', 'Surprise Pinata Pop', 'Crack it open to a shower of candy and chocolates hidden inside a chocolate shell cake.', 'Pinata Cakes', 1199, null, '1 kg', '{Chocolate}', false, 0, 6, '{https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=85}', '{Flour,Sugar,"Cocoa Powder",Candy,Chocolate}', '{Dairy,Gluten,Nuts}', '3 Days', false, 0, 0, '{same-day,fixed-time}'),
    ('pull-me-up-surprise', 'PM-012', 'Pull-Me-Up Surprise', 'Pull the ribbon to reveal a hidden burst of chocolates and confetti inside this novelty cake.', 'Pull Me Up Cakes', 1299, null, '1 kg', '{Chocolate,Vanilla}', false, 0, 6, '{https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800&q=85}', '{Flour,Sugar,Butter,Chocolate,Confetti}', '{Dairy,Gluten}', '3 Days', false, 0, 0, '{same-day,fixed-time}'),
    ('golden-caramel-drip', 'DR-013', 'Golden Caramel Drip', 'Moist vanilla layers finished with a glossy caramel drip and toffee crumble.', 'Drip Cakes', 749, null, '1 kg', '{Butterscotch,Vanilla}', true, 50, 14, '{https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=85}', '{Flour,Sugar,Caramel,Butter,Toffee}', '{Dairy,Gluten}', '3 Days', true, 0, 0, '{60-min,same-day,midnight,fixed-time}'),
    ('new-york-baked-cheesecake', 'CH-014', 'New York Baked Cheesecake', 'Dense, creamy and classic — baked slow for that unmistakable New York finish.', 'Cheesecakes', 899, null, '0.5 kg', '{"Cream Cheese"}', true, 0, 10, '{https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=85}', '{"Cream Cheese","Digestive Biscuit",Sugar,Eggs}', '{Dairy,Gluten,Eggs}', '4 Days', true, 0, 0, '{same-day,fixed-time}'),
    ('blueberry-swirl-cheesecake', 'CH-015', 'Blueberry Swirl Cheesecake', 'A silky baked cheesecake marbled with a tangy blueberry compote swirl.', 'Cheesecakes', 949, null, '0.5 kg', '{Blueberry}', true, 0, 8, '{https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=800&q=85}', '{"Cream Cheese","Digestive Biscuit",Blueberry,Sugar}', '{Dairy,Gluten,Eggs}', '4 Days', false, 0, 0, '{same-day,fixed-time}'),
    ('half-chocolate-truffle', 'HF-016', 'Half Chocolate Truffle', 'All the richness of our signature chocolate truffle cake, right-sized for smaller gatherings.', 'Half Cakes', 399, null, '0.25 kg', '{Chocolate}', true, 40, 20, '{https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=85}', '{Flour,Sugar,"Cocoa Powder",Cream}', '{Dairy,Gluten,Soy}', '2 Days', false, 0, 0, '{60-min,same-day,fixed-time}')
  on conflict (slug) do nothing
  returning id, slug
)
insert into product_variants (product_id, weight, price_multiplier, serves, sort_order)
select p.id, v.weight, v.mult, v.serves, v.ord
from p
join (values
  ('mini-love-bento', '0.25 kg', 1.0, '1-2', 1),
  ('rose-gold-elegance', '1 kg', 1.0, '8-10', 1),
  ('rose-gold-elegance', '2 kg', 1.9, '16-20', 2),
  ('superhero-blast', '1 kg', 1.0, '8-10', 1),
  ('superhero-blast', '1.5 kg', 1.45, '12-15', 2),
  ('classic-photo-cake', '0.5 kg', 1.0, '4-5', 1),
  ('classic-photo-cake', '1 kg', 1.8, '8-10', 2),
  ('heartfelt-red-velvet', '1 kg', 1.0, '8-10', 1),
  ('surprise-pinata-pop', '1 kg', 1.0, '8-10', 1),
  ('pull-me-up-surprise', '1 kg', 1.0, '8-10', 1),
  ('golden-caramel-drip', '1 kg', 1.0, '8-10', 1),
  ('golden-caramel-drip', '2 kg', 1.9, '16-20', 2),
  ('new-york-baked-cheesecake', '0.5 kg', 1.0, '4-5', 1),
  ('blueberry-swirl-cheesecake', '0.5 kg', 1.0, '4-5', 1),
  ('half-chocolate-truffle', '0.25 kg', 1.0, '2-3', 1)
) as v(slug, weight, mult, serves, ord) on v.slug = p.slug;

-- ============================================================
-- DEMO ORDERS (spread across every status, multiple cities)
-- ============================================================

with order_data as (
  insert into orders (order_number, status, payment_status, payment_method, subtotal, delivery_fee, total_amount, delivery_type, delivery_date, customer_name, customer_phone, customer_email, delivery_address, created_at)
  values
    ('CCDEMO0001', 'delivered', 'paid', 'cod', 599, 0, 599, 'same-day', current_date - 12, 'Rahul Sharma', '9811122233', 'rahul.sharma@example.com', '{"line1":"A-12, Sector 4","line2":"Near Metro Station","city":"Delhi NCR","pincode":"110001"}', now() - interval '12 days'),
    ('CCDEMO0002', 'delivered', 'paid', 'cod', 749, 0, 749, 'midnight', current_date - 9, 'Priya Desai', '9822233344', 'priya.desai@example.com', '{"line1":"204, Marine Heights","line2":"Bandra West","city":"Mumbai","pincode":"400001"}', now() - interval '9 days'),
    ('CCDEMO0003', 'delivered', 'paid', 'cod', 899, 0, 899, 'fixed-time', current_date - 7, 'Amit Kumar', '9833344455', 'amit.kumar@example.com', '{"line1":"15, Lake View Apartments","line2":"Indiranagar","city":"Bangalore","pincode":"560001"}', now() - interval '7 days'),
    ('CCDEMO0004', 'delivered', 'paid', 'cod', 749, 0, 749, 'same-day', current_date - 5, 'Neha Singh', '9844455566', 'neha.singh@example.com', '{"line1":"B-7, Green Park","line2":"","city":"Delhi NCR","pincode":"110002"}', now() - interval '5 days'),
    ('CCDEMO0005', 'out_for_delivery', 'pending', 'cod', 649, 49, 698, 'fixed-time', current_date, 'Vikram Patel', '9855566677', 'vikram.patel@example.com', '{"line1":"301, Jubilee Towers","line2":"Banjara Hills","city":"Hyderabad","pincode":"500001"}', now() - interval '2 hours'),
    ('CCDEMO0006', 'preparing', 'pending', 'cod', 899, 0, 899, 'same-day', current_date, 'Ananya Reddy', '9866677788', 'ananya.reddy@example.com', '{"line1":"22, Palm Grove","line2":"Koramangala","city":"Bangalore","pincode":"560002"}', now() - interval '45 minutes'),
    ('CCDEMO0007', 'pending', 'pending', 'cod', 749, 49, 798, 'midnight', current_date + 1, 'Sanjay Mehta', '9877788899', 'sanjay.mehta@example.com', '{"line1":"18, Sunrise Society","line2":"Andheri East","city":"Mumbai","pincode":"400002"}', now() - interval '20 minutes'),
    ('CCDEMO0008', 'cancelled', 'refunded', 'cod', 599, 0, 599, 'same-day', current_date - 3, 'Kavita Nair', '9888899900', 'kavita.nair@example.com', '{"line1":"9, Hill Road","line2":"","city":"Delhi NCR","pincode":"110003"}', now() - interval '3 days')
  on conflict (order_number) do nothing
  returning id, order_number
)
insert into order_items (order_id, product_id, product_name, sku, image, weight, flavor, eggless, unit_price, quantity, line_total)
select o.id, prod.id, prod.name, prod.sku, prod.images[1], items.weight, items.flavor, items.eggless, items.unit_price, 1, items.unit_price
from order_data o
join (values
  ('CCDEMO0001', 'classic-belgian-truffle', '0.5 kg', 'Chocolate', false, 599),
  ('CCDEMO0002', 'midnight-red-velvet', '0.5 kg', 'Red Velvet', false, 749),
  ('CCDEMO0003', 'new-york-baked-cheesecake', '0.5 kg', 'Cream Cheese', false, 899),
  ('CCDEMO0004', 'heartfelt-red-velvet', '1 kg', 'Red Velvet', false, 749),
  ('CCDEMO0005', 'fresh-strawberry-cloud', '0.5 kg', 'Strawberry', false, 649),
  ('CCDEMO0006', 'new-york-baked-cheesecake', '0.5 kg', 'Cream Cheese', false, 899),
  ('CCDEMO0007', 'midnight-red-velvet', '0.5 kg', 'Red Velvet', false, 749),
  ('CCDEMO0008', 'classic-belgian-truffle', '0.5 kg', 'Chocolate', false, 599)
) as items(order_number, slug, weight, flavor, eggless, unit_price) on items.order_number = o.order_number
join products prod on prod.slug = items.slug;

-- ============================================================
-- REVIEWS (on the delivered demo orders only, per the real
-- "delivered orders only" rule that governs genuine reviews too)
-- ============================================================

insert into reviews (order_item_id, product_id, customer_name, rating, comment)
select oi.id, oi.product_id, o.customer_name, r.rating, r.comment
from order_items oi
join orders o on o.id = oi.order_id
join (values
  ('CCDEMO0001', 5, 'Absolutely delicious — the chocolate was rich without being too sweet. Will order again!'),
  ('CCDEMO0002', 5, 'Best red velvet I''ve had in Mumbai. Soft, moist, and beautifully packed.'),
  ('CCDEMO0003', 4, 'Great cheesecake, creamy texture. Delivery was right on time.'),
  ('CCDEMO0004', 5, 'Ordered this for my mom''s birthday, she loved the heart shape and the taste was perfect.')
) as r(order_number, rating, comment) on r.order_number = o.order_number
on conflict (order_item_id) do nothing;
