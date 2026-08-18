-- ── DISABLE RESTRICTIVE POLICIES ──────────────────────────────────────────
-- Drop all existing restrictive policies that rely on auth.uid()
drop policy if exists "users: read own" on public.users;
drop policy if exists "users: insert own" on public.users;
drop policy if exists "users: update own" on public.users;
drop policy if exists "users: group members can read" on public.users;

drop policy if exists "groups: read members" on public.groups;
drop policy if exists "groups: insert admin" on public.groups;
drop policy if exists "groups: update admin" on public.groups;

drop policy if exists "group_members: read own group" on public.group_members;
drop policy if exists "group_members: insert admin" on public.group_members;
drop policy if exists "group_members: update admin" on public.group_members;
drop policy if exists "group_members: delete admin" on public.group_members;

drop policy if exists "contributions: read own group" on public.contributions;
drop policy if exists "contributions: insert own" on public.contributions;
drop policy if exists "contributions: update treasurer" on public.contributions;

drop policy if exists "loans: read own group" on public.loans;
drop policy if exists "loans: insert own" on public.loans;
drop policy if exists "loans: update admin" on public.loans;

drop policy if exists "loan_repayments: read own group" on public.loan_repayments;
drop policy if exists "loan_repayments: insert own" on public.loan_repayments;
drop policy if exists "loan_repayments: update treasurer" on public.loan_repayments;

drop policy if exists "fines: read own group" on public.fines;
drop policy if exists "fines: insert auto" on public.fines;
drop policy if exists "fines: update treasurer" on public.fines;

drop policy if exists "trust_scores: read own group" on public.trust_scores;

drop policy if exists "audit_logs: read own group" on public.audit_logs;
drop policy if exists "audit_logs: insert any" on public.audit_logs;

drop policy if exists "notifications: read own" on public.notifications;
drop policy if exists "notifications: update own" on public.notifications;

-- ── CREATE OPEN RLS POLICIES FOR MVP ──────────────────────────────────────
-- Since Clerk is being used without a JWT template synced to Supabase auth,
-- auth.uid() will be null. For the MVP, we will allow all authenticated
-- anon clients (public) to read/write.

-- Users
create policy "users: open access" on public.users for all to public using (true) with check (true);

-- Groups
create policy "groups: open access" on public.groups for all to public using (true) with check (true);

-- Group Members
create policy "group_members: open access" on public.group_members for all to public using (true) with check (true);

-- Contributions
create policy "contributions: open access" on public.contributions for all to public using (true) with check (true);

-- Loans
create policy "loans: open access" on public.loans for all to public using (true) with check (true);

-- Loan Repayments
create policy "loan_repayments: open access" on public.loan_repayments for all to public using (true) with check (true);

-- Fines
create policy "fines: open access" on public.fines for all to public using (true) with check (true);

-- Trust Scores
create policy "trust_scores: open access" on public.trust_scores for all to public using (true) with check (true);

-- Audit Logs
create policy "audit_logs: open access" on public.audit_logs for all to public using (true) with check (true);

-- Notifications
create policy "notifications: open access" on public.notifications for all to public using (true) with check (true);
