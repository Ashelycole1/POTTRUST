-- ─────────────────────────────────────────────────────────────────────────────
-- PotTrust — Migration Patch v2
-- File: supabase/migrations/20260818010000_role_management.sql
-- Adds RLS policies that allow:
--   • Admin    → update ANY group_member's role across all groups
--   • Chairperson → update roles within their own group only
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop old generic select policy and add update policies
drop policy if exists "group_members: read own group"          on public.group_members;
drop policy if exists "group_members: chairperson update role" on public.group_members;
drop policy if exists "group_members: admin update role"       on public.group_members;

-- Recreate read policy (unchanged)
create policy "group_members: read own group"
  on public.group_members for select
  using (
    exists (
      select 1 from public.group_members gm2
      join public.users u on u.id = gm2.user_id
      where gm2.group_id = group_members.group_id
        and u.clerk_id   = auth.uid()::text
    )
  );

-- Chairperson can change roles of members within their own group
-- (but NOT escalate to Admin — only Admin can set Admin role)
create policy "group_members: chairperson update role"
  on public.group_members for update
  using (
    -- The editor must be a Chairperson in the SAME group
    exists (
      select 1 from public.group_members chair_gm
      join public.users u on u.id = chair_gm.user_id
      where chair_gm.group_id = group_members.group_id
        and u.clerk_id        = auth.uid()::text
        and chair_gm.role     = 'Chairperson'
    )
  )
  with check (
    -- Cannot set role to Admin (only Admin can do that)
    role <> 'Admin'
  );

-- Admin can change any member's role in any group (including to Admin)
create policy "group_members: admin update role"
  on public.group_members for update
  using (
    exists (
      select 1 from public.group_members admin_gm
      join public.users u on u.id = admin_gm.user_id
      where u.clerk_id    = auth.uid()::text
        and admin_gm.role = 'Admin'
    )
  );

-- Admin can also insert new members into any group
drop policy if exists "group_members: admin insert" on public.group_members;
create policy "group_members: admin insert"
  on public.group_members for insert
  with check (
    exists (
      select 1 from public.group_members admin_gm
      join public.users u on u.id = admin_gm.user_id
      where u.clerk_id    = auth.uid()::text
        and admin_gm.role = 'Admin'
    )
  );
