-- ── OPEN STORAGE RLS POLICIES ─────────────────────────────────────────────────
-- Since the app uses Clerk (not Supabase Auth), there is no auth.uid() available.
-- We open the storage buckets to allow all operations so uploads work correctly.
-- This mirrors the open-access approach used for database tables.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── avatars bucket ────────────────────────────────────────────────────────────
drop policy if exists "avatars: public read"     on storage.objects;
drop policy if exists "avatars: authenticated upload" on storage.objects;
drop policy if exists "avatars: authenticated update" on storage.objects;
drop policy if exists "avatars: authenticated delete" on storage.objects;
drop policy if exists "allow all on avatars"     on storage.objects;

create policy "allow all on avatars"
  on storage.objects for all
  using ( bucket_id = 'avatars' )
  with check ( bucket_id = 'avatars' );

-- ── group-assets bucket ───────────────────────────────────────────────────────
drop policy if exists "group-assets: public read"          on storage.objects;
drop policy if exists "group-assets: authenticated upload"  on storage.objects;
drop policy if exists "group-assets: authenticated update"  on storage.objects;
drop policy if exists "group-assets: authenticated delete"  on storage.objects;
drop policy if exists "allow all on group-assets"          on storage.objects;

create policy "allow all on group-assets"
  on storage.objects for all
  using ( bucket_id = 'group-assets' )
  with check ( bucket_id = 'group-assets' );

-- ── pottrust_uploads bucket ───────────────────────────────────────────────────
drop policy if exists "allow all on pottrust_uploads"      on storage.objects;

create policy "allow all on pottrust_uploads"
  on storage.objects for all
  using ( bucket_id = 'pottrust_uploads' )
  with check ( bucket_id = 'pottrust_uploads' );
