-- ============================================================
-- G Horizon — Supabase setup
-- Run this ONCE in your Supabase project:
--   Dashboard  →  SQL Editor  →  New query  →  paste  →  Run
-- ============================================================

-- 1) Table that holds every listing (the whole property object lives in `data`)
create table if not exists public.properties (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz default now()
);

-- 2) Turn on Row Level Security
alter table public.properties enable row level security;

-- 3) Policies:  anyone can READ,  only signed-in staff can WRITE
drop policy if exists "public read properties" on public.properties;
create policy "public read properties"
  on public.properties for select using (true);

drop policy if exists "auth write properties" on public.properties;
create policy "auth write properties"
  on public.properties for all to authenticated
  using (true) with check (true);

-- 4) Storage bucket for uploaded property photos (public read)
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- 5) Storage policies:  anyone can VIEW photos,  only staff can UPLOAD/DELETE
drop policy if exists "public read images" on storage.objects;
create policy "public read images"
  on storage.objects for select using (bucket_id = 'property-images');

drop policy if exists "auth write images" on storage.objects;
create policy "auth write images"
  on storage.objects for all to authenticated
  using (bucket_id = 'property-images')
  with check (bucket_id = 'property-images');
