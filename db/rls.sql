
-- Enable RLS and helper schema

-- 0) Ensure the helper schema exists
create schema if not exists app;


-- 1) Enable Row-Level Security on all relevant tables
alter table users enable row level security;
alter table user_agency_memberships enable row level security;
alter table caregivers enable row level security;
alter table caregiver_addresses enable row level security;
alter table caregiver_availability enable row level security;
alter table clients enable row level security;
alter table client_addresses enable row level security;
alter table client_care_windows enable row level security;
alter table shifts enable row level security;
alter table assignments enable row level security;
alter table sales_inquiries enable row level security;

-- Helper: resolve the current user's Clerk id from JWT (to be wired later).
-- For now, we fallback to NULL which means policies relying on user context will deny unless using service role.
create or replace function app.current_user_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '');
$$;

-- Helper: find agency_ids for current user
create or replace view app.current_user_agencies as
select uam.agency_id
from user_agency_memberships uam
where uam.user_id = app.current_user_id();

-- ================
-- USERS
-- ================
create policy users_read_self
on users for select
using (id = app.current_user_id());

create policy users_upsert_self
on users for insert with check (id = app.current_user_id());

-- ================
-- MEMBERSHIPS
-- ================
create policy memberships_read_own_agencies
on user_agency_memberships for select
using (user_id = app.current_user_id());

-- ================
-- CAREGIVERS
-- ================
create policy caregivers_read_by_agency
on caregivers for select
using (
  agency_id in (select agency_id from app.current_user_agencies)
);

create policy caregivers_insert_by_admins
on caregivers for insert
with check (
  -- allow service role for now; later refine by role column via a join
  true
);

create policy caregivers_update_by_admins
on caregivers for update
using (true)
with check (true);

-- ================
-- CAREGIVER ADDRESSES (PHI-ish)
-- ================
create policy caregiver_addresses_read_by_agency
on caregiver_addresses for select
using (
  caregiver_id in (
    select c.id from caregivers c
    where c.agency_id in (select agency_id from app.current_user_agencies)
  )
);

-- ================
-- CLIENTS (mask PHI by role later in views)
-- ================
create policy clients_read_by_agency
on clients for select
using (
  agency_id in (select agency_id from app.current_user_agencies)
);

create policy clients_insert_by_admins
on clients for insert
with check (true);

create policy clients_update_by_admins
on clients for update
using (true)
with check (true);

-- ================
-- CLIENT ADDRESSES (PHI)
-- ================
create policy client_addresses_read_by_agency
on client_addresses for select
using (
  client_id in (
    select id from clients
    where agency_id in (select agency_id from app.current_user_agencies)
  )
);

-- ================
-- WINDOWS / SHIFTS / ASSIGNMENTS
-- ================
create policy client_windows_read_by_agency
on client_care_windows for select
using (
  client_id in (
    select id from clients
    where agency_id in (select agency_id from app.current_user_agencies)
  )
);

create policy caregiver_availability_read_by_agency
on caregiver_availability for select
using (
  caregiver_id in (
    select id from caregivers
    where agency_id in (select agency_id from app.current_user_agencies)
  )
);

create policy shifts_read_by_agency
on shifts for select
using (
  client_id in (
    select id from clients
    where agency_id in (select agency_id from app.current_user_agencies)
  )
);

create policy assignments_read_by_agency
on assignments for select
using (
  shift_id in (
    select s.id from shifts s
    join clients c on c.id = s.client_id
    where c.agency_id in (select agency_id from app.current_user_agencies)
  )
);
