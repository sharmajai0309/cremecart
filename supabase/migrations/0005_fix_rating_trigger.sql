-- Deleting a review previously reset rating/review_count to 0 via the
-- trigger, wiping the product's seed rating. Real reviews should still
-- aggregate normally, but the last review being removed should leave the
-- baseline rating alone rather than zeroing it out.

create or replace function update_product_rating() returns trigger
language plpgsql security definer as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
  cnt int := (select count(*) from reviews where product_id = pid);
begin
  if cnt > 0 then
    update products set
      rating = (select round(avg(rating)::numeric, 1) from reviews where product_id = pid),
      review_count = cnt
    where id = pid;
  end if;
  return null;
end;
$$;
