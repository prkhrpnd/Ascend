-- ====================================================================
-- ASCEND: RESPONSIBLE STUDENT CREDIT PLATFORM
-- Supabase Production Schema & Row Level Security (RLS) Policies
-- Migration: 001_initial_schema.sql
-- ====================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. USER PROFILES TABLE
-- Directly mapped to auth.users.id
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  institution text not null,
  course_program text,
  graduation_year integer,
  date_of_birth date,
  enrollment_status text not null default 'pending' check (enrollment_status in ('pending', 'verified', 'self_declared')),
  role text not null default 'student' check (role in ('student', 'admin', 'partner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 2. CONSENT RECORDS TABLE
-- Granular per-purpose DPDP-compliant consent tracking
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('cash_flow_assessment', 'identity_verification', 'account_aggregator_sync', 'parent_report_sharing')),
  data_categories text[] not null,
  consent_version text not null default 'v2.0',
  status text not null default 'granted' check (status in ('granted', 'revoked', 'expired')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.consents enable row level security;

create policy "Users can view own consents"
  on public.consents for select
  using (auth.uid() = user_id);

create policy "Users can create own consents"
  on public.consents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own consents"
  on public.consents for update
  using (auth.uid() = user_id);

-- 3. BANK CONNECTIONS TABLE
-- Account Aggregator and statement provider connection metadata
-- NEVER store credentials, PINs, OTPs, or AA secrets!
create table if not exists public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('account_aggregator', 'statement_upload', 'sandbox')),
  provider_account_id text,
  masked_account_number text,
  bank_name text not null,
  account_type text not null default 'savings',
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'pending')),
  consent_id uuid references public.consents(id) on delete set null,
  last_sync_at timestamptz default now(),
  is_disconnected boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.bank_connections enable row level security;

create policy "Users can view own bank connections"
  on public.bank_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert own bank connections"
  on public.bank_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bank connections"
  on public.bank_connections for update
  using (auth.uid() = user_id);

create policy "Users can delete own bank connections"
  on public.bank_connections for delete
  using (auth.uid() = user_id);

-- 4. STATEMENT UPLOADS TABLE
-- Tracks metadata for uploaded files in the private statements storage bucket
create table if not exists public.statement_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  content_type text not null,
  file_size integer not null,
  period_start date,
  period_end date,
  transaction_count integer not null default 0,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'processed', 'failed')),
  error_details text,
  created_at timestamptz not null default now()
);

alter table public.statement_uploads enable row level security;

create policy "Users can view own statement uploads"
  on public.statement_uploads for select
  using (auth.uid() = user_id);

create policy "Users can insert own statement uploads"
  on public.statement_uploads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own statement uploads"
  on public.statement_uploads for update
  using (auth.uid() = user_id);

create policy "Users can delete own statement uploads"
  on public.statement_uploads for delete
  using (auth.uid() = user_id);

-- 5. TRANSACTIONS TABLE
-- User-scoped parsed financial records
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  statement_id uuid references public.statement_uploads(id) on delete cascade,
  connection_id uuid references public.bank_connections(id) on delete cascade,
  transaction_date date not null,
  narration text not null,
  amount_paise bigint not null,
  type text not null check (type in ('CR', 'DR')),
  balance_paise bigint,
  category text not null default 'unknown',
  source text not null default 'rule' check (source in ('rule', 'ai', 'user')),
  confidence numeric not null default 0.8,
  is_loan_app boolean not null default false,
  is_round_trip boolean not null default false,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- 6. FINANCIAL ANALYSES TABLE
-- User cash flow metrics, recurring items, and coverage summaries
create table if not exists public.financial_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_version text not null default 'v2',
  period_start date,
  period_end date,
  months_count integer not null default 0,
  median_qualifying_income_paise bigint not null default 0,
  total_inflow_paise bigint not null default 0,
  total_outflow_paise bigint not null default 0,
  monthly_breakdowns jsonb not null default '[]'::jsonb,
  spending_by_category jsonb not null default '{}'::jsonb,
  recurring_items jsonb not null default '[]'::jsonb,
  confidence text not null default 'limited' check (confidence in ('limited', 'ok', 'good')),
  created_at timestamptz not null default now()
);

alter table public.financial_analyses enable row level security;

create policy "Users can view own financial analyses"
  on public.financial_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own financial analyses"
  on public.financial_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own financial analyses"
  on public.financial_analyses for delete
  using (auth.uid() = user_id);

-- 7. CREDIT SIMULATIONS & OFFERS TABLE
-- Explicitly tagged as illustrative simulation vs verified real partner offer
create table if not exists public.credit_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  simulated_limit_paise bigint not null default 50000,
  self_set_cap_paise bigint not null default 50000,
  tier_cap_paise bigint not null default 50000,
  capacity_cap_paise bigint not null default 0,
  stress_due_date_cap_paise bigint not null default 0,
  binding_cap text not null default 'tierCap',
  is_eligible boolean not null default false,
  reason_text text not null default '',
  backtest_results jsonb not null default '[]'::jsonb,
  is_real_offer boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.credit_simulations enable row level security;

create policy "Users can view own credit simulations"
  on public.credit_simulations for select
  using (auth.uid() = user_id);

create policy "Users can insert own credit simulations"
  on public.credit_simulations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own credit simulations"
  on public.credit_simulations for update
  using (auth.uid() = user_id);

-- 8. REPAYMENT & CYCLE RECORDS TABLE
create table if not exists public.repayment_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cycle_number integer not null,
  amount_paise bigint not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'on_time', 'late', 'waived')),
  late_fee_paise bigint not null default 0,
  repaid_at timestamptz,
  is_real_event boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.repayment_records enable row level security;

create policy "Users can view own repayment records"
  on public.repayment_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own repayment records"
  on public.repayment_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own repayment records"
  on public.repayment_records for update
  using (auth.uid() = user_id);

-- 9. PARENT / REPORT CARD SHARES TABLE
-- Secure token-hashed sharing of aggregate metrics only (never individual transactions!)
create table if not exists public.report_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  summary_data jsonb not null,
  is_revoked boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.report_shares enable row level security;

create policy "Users can view own report shares"
  on public.report_shares for select
  using (auth.uid() = user_id);

create policy "Users can insert own report shares"
  on public.report_shares for insert
  with check (auth.uid() = user_id);

create policy "Users can update own report shares"
  on public.report_shares for update
  using (auth.uid() = user_id);

create policy "Users can delete own report shares"
  on public.report_shares for delete
  using (auth.uid() = user_id);

-- 10. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  category text not null default 'security',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Users can view own audit logs"
  on public.audit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own audit logs"
  on public.audit_logs for insert
  with check (auth.uid() = user_id);

-- 11. STORAGE BUCKET CONFIGURATION
-- Private statement storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('statements', 'statements', false, 2097152, array['text/csv', 'application/vnd.ms-excel'])
on conflict (id) do nothing;

create policy "Users can upload statement files to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'statements' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own statement files"
  on storage.objects for select
  using (
    bucket_id = 'statements' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own statement files"
  on storage.objects for delete
  using (
    bucket_id = 'statements' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
