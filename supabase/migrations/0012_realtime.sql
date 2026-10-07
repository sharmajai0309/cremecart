-- Lets the admin UI subscribe to live changes on these tables instead of
-- only refreshing on page navigation (revalidatePath). Scoped to the
-- tables where multi-admin/multi-tab staleness actually matters.
alter publication supabase_realtime add table products, orders, order_items;
