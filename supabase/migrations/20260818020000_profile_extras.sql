-- ── Add extra profile columns to users table ────────────────────────────────
alter table public.users
  add column if not exists phone              text,
  add column if not exists nin               text,
  add column if not exists nok_name          text,
  add column if not exists nok_phone         text,
  add column if not exists preferred_language text default 'English';

-- ── Add extra columns to groups table ───────────────────────────────────────
alter table public.groups
  add column if not exists description    text,
  add column if not exists location       text,
  add column if not exists contact_phone  text,
  add column if not exists contact_email  text,
  add column if not exists website        text,
  add column if not exists logo_url       text,
  add column if not exists banner_url     text,
  add column if not exists currency       text default 'UGX',
  add column if not exists cycle_frequency text default 'monthly',
  add column if not exists due_day        integer default 15,
  add column if not exists grace_days     integer default 3;

-- ── Storage buckets for avatars and group assets ─────────────────────────────
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('group-assets', 'group-assets', true)
  on conflict (id) do nothing;

-- Allow authenticated users to upload to avatars bucket (own folder)
drop policy if exists "avatars: upload own" on storage.objects;
create policy "avatars: upload own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = 'avatars'
  );

drop policy if exists "avatars: read all" on storage.objects;
create policy "avatars: read all"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "avatars: update own" on storage.objects;
create policy "avatars: update own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars');

-- Allow chairperson / treasurer to upload group assets
drop policy if exists "group-assets: upload" on storage.objects;
create policy "group-assets: upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'group-assets');

drop policy if exists "group-assets: read all" on storage.objects;
create policy "group-assets: read all"
  on storage.objects for select
  to public
  using (bucket_id = 'group-assets');

drop policy if exists "group-assets: update" on storage.objects;
create policy "group-assets: update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'group-assets');
