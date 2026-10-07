-- Gift options on orders: mark an order as a gift, capture the recipient's
-- name and the message to print on the card, and let the customer hide prices
-- on the packing slip. `delivery_date` and `delivery_slot` already exist from
-- 0001_init — these are the remaining checkout fields the storefront collects.
alter table orders
  add column is_gift boolean not null default false,
  add column gift_recipient_name text,
  add column gift_message text;
