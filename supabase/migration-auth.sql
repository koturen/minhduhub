-- DÀNH CHO DỰ ÁN ĐÃ CHẠY schema.sql CŨ. Chạy một lần trong SQL Editor -> Run.
-- 1) Mỗi mục thuộc về một người dùng; 2) chỉ người đã đăng nhập mới được thêm; 3) bỏ bắt buộc danh mục.

alter table public.media add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.media alter column category set default '';

drop policy if exists "restricted insert" on public.media;
drop policy if exists "logged in insert" on public.media;
create policy "logged in insert" on public.media
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    and visibility = 'public'
    and url like 'https://res.cloudinary.com/hysrf8xi/%'
    and (thumbnail_url is null or thumbnail_url like 'https://res.cloudinary.com/hysrf8xi/%')
  );

-- Chủ sở hữu được xóa mục của chính mình.
drop policy if exists "owner delete" on public.media;
create policy "owner delete" on public.media
  for delete to authenticated using (owner_id = auth.uid());
