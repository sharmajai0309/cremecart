-- Makes the neutral surface/ink palette admin-editable so the whole theme
-- (not just primary/accent) can be re-skinned from the admin Theme panel.
-- Defaults match the Editorial Patisserie design.
alter table site_settings
  add column surface_color text not null default '#fff8f5',
  add column surface_low_color text not null default '#fcf2ec',
  add column surface_container_color text not null default '#f6ece7',
  add column surface_high_color text not null default '#f0e6e1',
  add column surface_highest_color text not null default '#ebe0dc',
  add column line_color text not null default '#e6e2dd',
  add column line_strong_color text not null default '#c3c8c2',
  add column ink_color text not null default '#1f1b18',
  add column ink_variant_color text not null default '#424844',
  add column ink_soft_color text not null default '#737874';
