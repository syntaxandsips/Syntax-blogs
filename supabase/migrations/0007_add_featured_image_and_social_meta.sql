alter table public.posts
  add column if not exists featured_image_url text,
  add column if not exists social_image_url text;
