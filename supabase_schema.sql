-- ═══════════════════════════════════════════════════════════════════════════════
-- PotTrust — Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. USERS — synced from Clerk via webhook or on first login
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  clerk_id      text unique not null,
  email         text unique not null,
  first_name    text,
  last_name     text,
  phone         text,
  nin           text,                    -- National ID number (encrypted ideally)
  avatar_url    text,
  nok_name      text,                    -- Next of Kin name
  nok_phone     text,                    -- Next of Kin phone
  language      text default 'English',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. GROUPS — SACCO groups managed on the platform
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.groups (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  description         text,
  logo_url            text,
  banner_url          text,
  location            text,
  phone               text,
  email               text,
  website             text,
  currency            text default 'UGX',
  contribution_amount bigint default 200000,  -- in smallest currency unit
  cycle_frequency     text default 'monthly',  -- weekly | biweekly | monthly | quarterly
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
-- 3. GROUP MEMBERS — join table linking users to groups with a role
-- ─────────────────────────────────────────────────────────────────────────────
create type if not exists member_role as enum ('Member', 'Treasurer', 'Chairperson', 'Admin');

create table if not exists public.group_members (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  role        member_role default 'Member',
  joined_at   timestamptz default now(),
  unique (group_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CONTRIBUTIONS — monthly/cyclic payment records per member per group
-- ─────────────────────────────────────────────────────────────────────────────
create type if not exists contrib_status as enum ('PAID', 'PENDING', 'OVERDUE', 'REJECTED');

create table if not exists public.contributions (
  id              uuid primary key default uuid_generate_v4(),
  group_id        uuid not null references public.groups(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  cycle_label     text not null,             -- e.g. "Aug 2026"
  amount          bigint not null,
  payment_mode    text,                       -- MTN MoMo | Airtel Money | Bank Transfer | Cash
  txn_ref         text,
  proof_url       text,
  notes           text,
  status          contrib_status default 'PENDING',
  reviewed_by     uuid references public.users(id),
  reviewed_at     timestamptz,
  rejection_reason text,
  submitted_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. LOANS — loan requests and their lifecycle
-- ─────────────────────────────────────────────────────────────────────────────
create type if not exists loan_status as enum ('PENDING', 'APPROVED', 'ACTIVE', 'CLEARED', 'REJECTED', 'AT RISK');

create table if not exists public.loans (
  id              uuid primary key default uuid_generate_v4(),
  group_id        uuid not null references public.groups(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  amount          bigint not null,
  outstanding     bigint not null,
  total_paid      bigint default 0,
  term_months     int  default 8,
  purpose         text,
  status          loan_status default 'PENDING',
  approved_by     uuid references public.users(id),
  approved_at     timestamptz,
  rejection_reason text,
  requested_at    timestamptz default now(),
  updated_at      timestamptz default now()
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
  instalment_no int,
  paid_at       timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FINES — fines issued to members
-- ─────────────────────────────────────────────────────────────────────────────
create type if not exists fine_status as enum ('OUTSTANDING', 'PAID', 'WAIVED');

create table if not exists public.fines (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  amount      bigint not null,
  reason      text,
  issued_by   uuid references public.users(id),
  status      fine_status default 'OUTSTANDING',
  issued_at   timestamptz default now(),
  paid_at     timestamptz
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TRUST SCORES — computed trust score history per user per group
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
  detail      text,            -- sub-text / amount / reference
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
-- Row Level Security (RLS) — enable on every table
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

-- ── BASIC POLICIES (expand to suit your RBAC needs) ─────────────────────────
-- Users can read their own profile
create policy "Users: read own" on public.users
  for select using (auth.uid()::text = clerk_id);

create policy "Users: update own" on public.users
  for update using (auth.uid()::text = clerk_id);

create policy "Users: insert own" on public.users
  for insert with check (auth.uid()::text = clerk_id);

-- Group members can read their group
create policy "Groups: members can read" on public.groups
  for select using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = groups.id
        and u.clerk_id  = auth.uid()::text
    )
  );

-- Contributions: members read own group's records
create policy "Contributions: members read" on public.contributions
  for select using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = contributions.group_id
        and u.clerk_id  = auth.uid()::text
    )
  );

-- Members can insert their own contributions
create policy "Contributions: self insert" on public.contributions
  for insert with check (
    exists (
      select 1 from public.users u
      where u.id = contributions.user_id
        and u.clerk_id = auth.uid()::text
    )
  );

-- Notifications: user reads own
create policy "Notifications: read own" on public.notifications
  for select using (
    exists (
      select 1 from public.users u
      where u.id = notifications.user_id
        and u.clerk_id = auth.uid()::text
    )
  );

-- Audit logs: any group member can read
create policy "Audit logs: members read" on public.audit_logs
  for select using (
    exists (
      select 1 from public.group_members gm
      join public.users u on u.id = gm.user_id
      where gm.group_id = audit_logs.group_id
        and u.clerk_id  = auth.uid()::text
    )
  );
