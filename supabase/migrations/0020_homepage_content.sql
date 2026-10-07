-- Makes the remaining hardcoded homepage content editable from the admin panel.
-- Stored as JSONB on the site_settings singleton; components fall back to code
-- defaults when a field is empty.
alter table site_settings
  add column hero_stats jsonb not null default $json$[
    {"value":"100%","label":"Freshly baked at dawn"},
    {"value":"4.9★","label":"18,000+ celebrations"},
    {"value":"60m","label":"Chilled express courier"}
  ]$json$::jsonb,
  add column delivery_options jsonb not null default $json$[
    {"title":"60-Min Express","text":"Fresh bento, tea cakes and selected cheesecakes dispatched straight from our oven hubs.","cta":"Instant Dispatch"},
    {"title":"Same-Day Evening","text":"Order before 4:00 PM for flawless dinner-party and sunset anniversary surprises.","cta":"By 8:00 PM Today"},
    {"title":"Exact 2-Hour Slot","text":"Lock in an accurate 2-hour window up to 30 days ahead for venue party setups.","cta":"Pre-Schedule Slot"},
    {"title":"Midnight Surprise","text":"Delivered at the stroke of 11:59 PM to usher in birthdays with champagne elegance.","cta":"11:45 PM – 12:15 AM"}
  ]$json$::jsonb,
  add column trust_badges jsonb not null default $json$[
    {"title":"100% Freshly Baked","text":"Batched daily at 5:00 AM. Zero premixes, preservatives, or artificial palm oils."},
    {"title":"Cold-Chain Temperature Lock","text":"Transported strictly at 4°C in shock-absorbent caskets so frosting never melts."},
    {"title":"Single-Origin Terroir","text":"Pure French Valrhona cocoa, Tahitian vanilla bean, and Grade-A Kashmiri saffron."},
    {"title":"Handcrafted by Masters","text":"Trained by Ferrandi and Le Cordon Bleu pastry virtuosos right here in India."}
  ]$json$::jsonb,
  add column gifting_collections jsonb not null default $json$[
    {"title":"The Connoisseur Keepsake Box","text":"Includes a custom petite bento cake, 8 Parisian macarons, and 9 Belgian single-origin truffles.","image":"https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1000&q=85","price":"₹3,450","tag":"Signature Hamper","meta":"Complete Hamper","href":"/hampers"},
    {"title":"Artisanal Tea-Time Platter","text":"12 French Canelés de Bordeaux, browned-butter madeleines, and roasted pistachio financiers.","image":"https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1000&q=85","price":"₹2,650","tag":"High-Tea Platter","meta":"Serves 6–8","href":"/hampers"},
    {"title":"Celebration Royale Hamper","text":"A wild berry torte, twin crystal coupes, and a hand-poured Tahitian vanilla celebration candle.","image":"https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1000&q=85","price":"₹4,200","tag":"VIP Milestone","meta":"Exclusive Edition","href":"/hampers"}
  ]$json$::jsonb;
