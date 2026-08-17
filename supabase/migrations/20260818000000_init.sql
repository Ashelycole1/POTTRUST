-- ═══════════════════════════════════════════════════════════════════════════════
-- PotTrust — Full Supabase Migration  v2
-- File: supabase/migrations/20260818000000_init.sql
-- Run via: Supabase dashboard SQL Editor  OR  Supabase CLI `supabase db push`
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. USERS — synced from Clerk on every login
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  clerk_id      text unique not null,
  email         text unique not null,
  first_name    text,
  last_name     text,
  phone         text,
  nin           text,                     -- National ID Number
  -- avatar stored in Storage bucket; this col holds the public URL
  avatar_url    text,
  nok_name      text,                     -- Next of Kin name
  nok_phone     text,                     -- Next of Kin phone
  language      text default 'English',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. GROUPS (SACCOs)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.groups (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  description         text,
  -- logo & banner stored in Storage bucket; cols hold public URLs
  logo_url            text,
  banner_url          text,
  location            text,
  phone               text,
  email               text,
  website             text,
  currency            text default 'UGX',
  contribution_amount bigint default 200000,  -- in smallest currency unit
  cycle_frequency     text default 'monthly', -- weekly | biweekly | monthly | quarterly
  due_day             int  default 15,
  grace_days          int  default 3,
  auto_fine           boolean default true,
  fine_amount         bigint default 5000,
  fine_max_cycles     int default 3,
  late_interest_rate  numeric(5,2) default 5.00,
  total_pot           bigint default 0,
  created_by          uuid references public.users(id),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. GROUP MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.member_role as enum ('Member', 'Treasurer', 'Chairperson', 'Admin');
exception when duplicate_object then null; end $$;

create table if not exists public.group_members (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  role        public.member_role default 'Member',
  joined_at   timestamptz default now(),
  unique (group_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CONTRIBUTIONS — monthly/cyclic payment records
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.contrib_status as enum ('PAID', 'PENDING', 'OVERDUE', 'REJECTED');
exception when duplicate_object then null; end $$;

create table if not exists public.contributions (
  id               uuid primary key default uuid_generate_v4(),
  group_id         uuid not null references public.groups(id) on delete cascade,
  user_id          uuid not null references public.users(id) on delete cascade,
  cycle_label      text not null,              -- e.g. "Aug 2026"
  amount           bigint not null,
  payment_mode     text,                        -- MTN MoMo | Airtel Money | Bank Transfer | Cash
  txn_ref          text,
  -- proof image stored in Storage bucket path: proofs/{group_id}/{user_id}/{uuid}.{ext}
  proof_url        text,
  notes            text,
  status           public.contrib_status default 'PENDING',
  reviewed_by      uuid references public.users(id),
  reviewed_at      timestamptz,
  rejection_reason text,
  submitted_at     timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. LOANS
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.loan_status as enum ('PENDING', 'APPROVED', 'ACTIVE', 'CLEARED', 'REJECTED', 'AT RISK');
exception when duplicate_object then null; end $$;

create table if not exists public.loans (
  id               uuid primary key default uuid_generate_v4(),
  group_id         uuid not null references public.groups(id) on delete cascade,
  user_id          uuid not null references public.users(id) on delete cascade,
  amount           bigint not null,
  outstanding      bigint not null,
  total_paid       bigint default 0,
  term_months      int  default 8,
  purpose          text,
  status           public.loan_status default 'PENDING',
  approved_by      uuid references public.users(id),
  approved_at      timestamptz,
  rejection_reason text,
  requested_at     timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. LOAN REPAYMENTS — individual instalment payments
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.loan_repayments (
  id            uuid primary key default uuid_generate_v4(),
  loan_id       uuid not null references public.loans(id) on delete cascade,
  user_id       uuid not null references public.users(id),
  amount        bigint not null,
  payment_mode  text,
  txn_ref       text,
  -- optional proof image for the repayment: proofs/repayments/{loan_id}/{uuid}.{ext}
  proof_url     text,
  instalment_no int,
  paid_at       timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FINES
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.fine_status as enum ('OUTSTANDING', 'PAID', 'WAIVED');
exception when duplicate_object then null; end $$;

create table if not exists public.fines (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  amount      bigint not null,
  reason      text,
  issued_by   uuid references public.users(id),
  status      public.fine_status default 'OUTSTANDING',
  issued_at   timestamptz default now(),
  paid_at     timestamptz
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TRUST SCORES — per user per group, history kept
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.trust_scores (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  score       int  not null default 700,
  tier        text not null default 'Good',
  cycle_label text not null,
  change      int  default 0,
  computed_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. AUDIT LOGS — immutable event ledger
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid references public.groups(id) on delete set null,
  user_id     uuid references public.users(id) on delete set null,
  action      text not null,   -- e.g. "CONTRIBUTION_VERIFIED"
  headline    text not null,   -- human-readable headline
  detail      text,
  color_hint  text,            -- "green" | "gold" | "coral"
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null,
  description text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-UPDATED `updated_at` TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

create or replace trigger trg_groups_updated_at
  before update on public.groups
  for each row execute procedure public.set_updated_at();

create or replace trigger trg_loans_updated_at
  before update on public.loans
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.users           enable row level security;
alter table public.groups          enable row level security;
alter table public.group_members   enable row level security;
alter table public.contributions   enable row level security;
alter table public.loans           enable row level security;
alter table public.loan_repayments enable row level security;
alter table public.fines           enable row level security;
alter table public.trust_scores    enable row level security;
alter table public.audit_logs      enable row level security;
alter table public.notifications   enable row level security;

-- ── USER POLICIES ────────────────────────────────────────────────────────────
create policy "users: read own"
  on public.users for select
  using (auth.uid()::text = clerk_id);

create policy "users: insert own"
  on public.users for insert
  with check (auth.uid()::text = clerk_id);

create policy "users: update own"
  on public.users for update
  using (auth.uid()::text = clerk_id);

-- Group members can see fellow members' basic profiles
create policy "users: group members can read"
  on public.users for select
  using (
    exists (
      select 1 from public.group_members my_gm
      join public.group_members their_gm on their_gm.group_id = my_gm.group_id
      join public.users me on me.id = my_gm.user_id
      where their_gm.user_id = users.id
        and me.clerk_id = auth.uid()::text
    )
  );

-- ── GROUP POLICIES ───────────────────────────────────────────────────────────
create policy "groups: members can read"
  on public.groups for select
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = groups.id
        and u.clerk_id  = auth.uid()::text
    )
  );

create policy "groups: chairperson can update"
  on public.groups for update
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = groups.id
        and u.clerk_id  = auth.uid()::text
        and gm.role in ('Chairperson', 'Admin')
    )
  );

-- ── GROUP MEMBERS POLICIES ───────────────────────────────────────────────────
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

-- ── CONTRIBUTIONS POLICIES ───────────────────────────────────────────────────
create policy "contributions: members read"
  on public.contributions for select
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = contributions.group_id
        and u.clerk_id  = auth.uid()::text
    )
  );

create policy "contributions: self insert"
  on public.contributions for insert
  with check (
    exists (
      select 1 from public.users u
      where u.id = contributions.user_id
        and u.clerk_id = auth.uid()::text
    )
  );

create policy "contributions: treasurer update"
  on public.contributions for update
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = contributions.group_id
        and u.clerk_id  = auth.uid()::text
        and gm.role in ('Treasurer', 'Chairperson', 'Admin')
    )
  );

-- ── LOANS POLICIES ───────────────────────────────────────────────────────────
create policy "loans: members read"
  on public.loans for select
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = loans.group_id
        and u.clerk_id  = auth.uid()::text
    )
  );

create policy "loans: self insert"
  on public.loans for insert
  with check (
    exists (
      select 1 from public.users u
      where u.id = loans.user_id
        and u.clerk_id = auth.uid()::text
    )
  );

create policy "loans: chair/admin update"
  on public.loans for update
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = loans.group_id
        and u.clerk_id  = auth.uid()::text
        and gm.role in ('Chairperson', 'Admin')
    )
  );

-- ── LOAN REPAYMENTS POLICIES ─────────────────────────────────────────────────
create policy "loan_repayments: members read own group"
  on public.loan_repayments for select
  using (
    exists (
      select 1 from public.loans l
      join public.group_members gm on gm.group_id = l.group_id
      join public.users u on u.id = gm.user_id
      where l.id = loan_repayments.loan_id
        and u.clerk_id = auth.uid()::text
    )
  );

create policy "loan_repayments: self insert"
  on public.loan_repayments for insert
  with check (
    exists (
      select 1 from public.users u
      where u.id = loan_repayments.user_id
        and u.clerk_id = auth.uid()::text
    )
  );

-- ── FINES POLICIES ───────────────────────────────────────────────────────────
create policy "fines: members read"
  on public.fines for select
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = fines.group_id
        and u.clerk_id  = auth.uid()::text
    )
  );

create policy "fines: chair/admin insert"
  on public.fines for insert
  with check (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = fines.group_id
        and u.clerk_id  = auth.uid()::text
        and gm.role in ('Chairperson', 'Admin')
    )
  );

-- ── TRUST SCORES POLICIES ────────────────────────────────────────────────────
create policy "trust_scores: members read"
  on public.trust_scores for select
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = trust_scores.group_id
        and u.clerk_id  = auth.uid()::text
    )
  );

-- ── AUDIT LOGS POLICIES ──────────────────────────────────────────────────────
create policy "audit_logs: members read"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = audit_logs.group_id
        and u.clerk_id  = auth.uid()::text
    )
  );

create policy "audit_logs: service insert"
  on public.audit_logs for insert
  with check (true); -- Allow all inserts; RLS on reads protects the data

-- ── NOTIFICATIONS POLICIES ───────────────────────────────────────────────────
create policy "notifications: read own"
  on public.notifications for select
  using (
    exists (
      select 1 from public.users u
      where u.id = notifications.user_id
        and u.clerk_id = auth.uid()::text
    )
  );

create policy "notifications: update own"
  on public.notifications for update
  using (
    exists (
      select 1 from public.users u
      where u.id = notifications.user_id
        and u.clerk_id = auth.uid()::text
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- Run these via: Supabase Dashboard → Storage → New Bucket (if SQL doesn't work)
-- OR paste the insert below into the SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Main uploads bucket (profile photos, logos, payment proofs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pottrust_uploads',
  'pottrust_uploads',
  true,               -- public: images are accessible via a URL without auth
  5242880,            -- 5 MB max per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
on conflict (id) do nothing;

-- ── STORAGE RLS POLICIES ─────────────────────────────────────────────────────

-- Any authenticated user can upload
create policy "storage: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pottrust_uploads');

-- Owner can update their own file
create policy "storage: owner update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'pottrust_uploads' and auth.uid() = owner);

-- Owner can delete their own file
create policy "storage: owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'pottrust_uploads' and auth.uid() = owner);

-- Anyone (including anonymous) can view/download (public bucket)
create policy "storage: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'pottrust_uploads');
