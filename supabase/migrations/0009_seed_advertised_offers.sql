-- The /offers page advertises these three codes to customers; they need to
-- actually exist as usable coupons or "Copy code" hands out a code that
-- fails at checkout. CAKEFRIEND approximates "free delivery on ₹999+" as a
-- flat ₹49 discount since there's no delivery-fee-specific coupon type yet.
insert into coupons (code, discount_type, discount_value, min_order_amount, is_active) values
  ('SWEET10', 'percent', 10, 999, true),
  ('CAKEFRIEND', 'flat', 49, 999, true),
  ('MIDNIGHT15', 'percent', 15, 0, true)
on conflict (code) do nothing;
