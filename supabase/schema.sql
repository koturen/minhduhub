-- DỰ ÁN MỚI HOÀN TOÀN: chạy tệp này trong SQL Editor. (Dự án đã có bảng thì chạy migration-auth.sql.)
-- Nếu cloud name Cloudinary khác "hysrf8xi", hãy sửa các dòng URL bên dưới.

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  description text check (char_length(description) <= 500),
  type text not null check (type in ('video', 'image')),
  resource_type text not null check (resource_type in ('video', 'image')),
  url text not null,
  thumbnail_url text,
  category text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  visibility text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  width int,
  height int,
  duration numeric,
  cloudinary_public_id text,
  format text,
  allow_download boolean not null default false,
  owner_id uuid references auth.users(id) on delete set null
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media(id) on delete cascade,
  reason text not null check (char_length(reason) <= 200),
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;
alter table public.reports enable row level security;

drop policy if exists "public read" on public.media;
create policy "public read" on public.media
  for select to anon, authenticated using (visibility = 'public');

drop policy if exists "logged in insert" on public.media;
create policy "logged in insert" on public.media
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    and visibility = 'public'
    and url like 'https://res.cloudinary.com/hysrf8xi/%'
    and (thumbnail_url is null or thumbnail_url like 'https://res.cloudinary.com/hysrf8xi/%')
  );

drop policy if exists "owner delete" on public.media;
create policy "owner delete" on public.media
  for delete to authenticated using (owner_id = auth.uid());

drop policy if exists "anyone can report" on public.reports;
create policy "anyone can report" on public.reports
  for insert to anon, authenticated with check (true);
