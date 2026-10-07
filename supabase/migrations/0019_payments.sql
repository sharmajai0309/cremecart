-- Online payments (Razorpay). `payment_method` already exists; this stores the
-- gateway's order id / payment reference so a payment can be reconciled and a
-- `payment_status` of 'paid' tied back to a specific transaction.
alter table orders add column payment_reference text;
create index on orders(payment_reference);
