-- Chạy toàn bộ tệp này trong Supabase: SQL Editor -> New query -> Run.
-- Nếu cloud name Cloudinary của bạn khác "hysrf8xi", hãy sửa dòng URL bên dưới.

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  description text check (char_length(description) <= 500),
  type text not null check (type in ('video', 'image')),
  resource_type text not null check (resource_type in ('video', 'image')),
  url text not null,
  thumbnail_url text,
  category text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  visibility text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  width int,
  height int,
  duration numeric,
  cloudinary_public_id text,
  format text,
  allow_download boolean not null default false
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media(id) on delete cascade,
  reason text not null check (char_length(reason) <= 200),
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;
alter table public.reports enable row level security;

-- Ai cũng xem được các mục công khai.
drop policy if exists "public read" on public.media;
create policy "public read" on public.media
  for select to anon, authenticated using (visibility = 'public');

-- Ai cũng thêm được, nhưng chỉ khi file nằm trên Cloudinary của bạn.
drop policy if exists "restricted insert" on public.media;
create policy "restricted insert" on public.media
  for insert to anon, authenticated
  with check (
    visibility = 'public'
    and url like 'https://res.cloudinary.com/hysrf8xi/%'
    and (thumbnail_url is null or thumbnail_url like 'https://res.cloudinary.com/hysrf8xi/%')
  );

-- Ai cũng gửi báo cáo được, nhưng không đọc được danh sách báo cáo.
drop policy if exists "anyone can report" on public.reports;
create policy "anyone can report" on public.reports
  for insert to anon, authenticated with check (true);

-- Không có policy update/delete: chỉ bạn (chủ dự án) sửa/xóa được trong Table Editor.
