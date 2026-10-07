-- Admins can hand-pick which products appear in the homepage "bestsellers"
-- rail; the homepage falls back to the automatic query when this is empty.
alter table site_settings add column featured_product_ids uuid[] not null default '{}';
