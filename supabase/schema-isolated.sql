-- Supabase Schema for Abiola Portfolio (Isolated Schema)
-- Run this in the Supabase SQL Editor at: https://dcnmoqfjamzcopyujobd.supabase.co
--
-- This schema uses a dedicated `portfolio` namespace to avoid conflicts with
-- other products sharing the same Supabase instance. All tables and policies
-- are scoped to this schema and will not interfere with other data.
--
-- IMPORTANT: This must be run MANUALLY in the Supabase SQL editor. The app
-- cannot run schema changes automatically (no service-role DB access configured).

-- Create the portfolio schema (isolated namespace)
create schema if not exists portfolio authorization postgres;

-- Allow authenticated users to use this schema
grant usage on schema portfolio to authenticated, anon;
grant create on schema portfolio to authenticated;

-- ============================================================================
-- Tables (created in the portfolio schema)
-- ============================================================================

-- Projects table — all project metadata
create table if not exists portfolio.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  category    text not null check (category in ('graphics', 'motion', 'playground')),
  subcategory text,
  description text,
  cover_url   text,
  images      text[],
  video_url   text,
  tags        text[],
  visible     boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- About table — single-row portfolio bio/metadata
create table if not exists portfolio.about (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  tagline     text,
  bio         text,
  photo_url   text,
  email       text,
  tools       text[],
  clients     text[],
  updated_at  timestamptz default now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on both tables
alter table portfolio.projects enable row level security;
alter table portfolio.about enable row level security;

-- Public read access: anyone can view visible projects
create policy "Public can read visible projects"
  on portfolio.projects for select
  using (visible = true);

-- Public read access: anyone can view the about row
create policy "Public can read about"
  on portfolio.about for select
  using (true);

-- ============================================================================
-- Admin Authorization Function (Defense in Depth)
-- ============================================================================
--
-- This function is used by all admin write policies below. It checks that the
-- current Supabase auth user's email matches the portfolio admin email. This
-- guards against any authenticated Supabase user (from other products in the
-- same instance) from modifying portfolio data.
--
-- The app layer (src/middleware.ts + src/services/auth.service.ts) enforces
-- the same check for defense in depth — if one layer fails, the other catches it.

create or replace function portfolio.is_portfolio_admin()
returns boolean language sql security definer stable as $$
  select auth.jwt() ->> 'email' = 'abiolaoyedele55@gmail.com';
$$;

-- Admin full access to projects (insert, update, delete)
create policy "Admin full access to projects"
  on portfolio.projects for all
  using (portfolio.is_portfolio_admin())
  with check (portfolio.is_portfolio_admin());

-- Admin full access to about (insert, update, delete)
create policy "Admin full access to about"
  on portfolio.about for all
  using (portfolio.is_portfolio_admin())
  with check (portfolio.is_portfolio_admin());

-- ============================================================================
-- Permissions (allow authenticated users to query, but RLS gates writes)
-- ============================================================================

-- Grant select, insert, update, delete to authenticated users
-- (RLS policies above gate who can actually perform these actions)
grant select, insert, update, delete on portfolio.projects to authenticated;
grant select, insert, update, delete on portfolio.about to authenticated;

-- Grant select to anon users (public read only)
grant select on portfolio.projects to anon;
grant select on portfolio.about to anon;

-- ============================================================================
-- Graphics vote counters + safe public increment RPC
-- ============================================================================
--
-- Adds two counters to portfolio.projects for the swipe-to-vote feature on
-- the /graphics canvas. Same rationale as the non-isolated schema.sql's
-- version of this block: a plain public UPDATE RLS policy can't
-- column-scope a write or express "increment by exactly 1" safely (RLS
-- gates row visibility, not columns, and has no access to the pre-update
-- value). This SECURITY DEFINER function is the correct tool —
-- anon/authenticated get EXECUTE on this one narrow, validated function,
-- never UPDATE on the table. The function lives in the portfolio schema,
-- mirroring the portfolio.is_portfolio_admin() convention above;
-- anon/authenticated already have USAGE on the portfolio schema (granted
-- near the top of this file), so only EXECUTE on this new function is
-- needed here.
--
-- Return columns are named new_likes/new_dislikes, not likes/dislikes, to
-- avoid an OUT-parameter/column-name collision inside the function body
-- (see schema.sql's version of this comment for the full explanation).
--
-- THIS BLOCK MUST BE RUN MANUALLY IN THE SUPABASE SQL EDITOR.

alter table portfolio.projects
  add column if not exists likes integer not null default 0 check (likes >= 0),
  add column if not exists dislikes integer not null default 0 check (dislikes >= 0);

create or replace function portfolio.increment_project_vote(project_id uuid, vote_type text)
returns table(new_likes integer, new_dislikes integer)
language plpgsql
security definer
set search_path = portfolio, pg_temp
as $$
begin
  if vote_type not in ('like', 'dislike') then
    raise exception 'invalid vote_type: %, expected ''like'' or ''dislike''', vote_type
      using errcode = '22023';
  end if;

  if not exists (select 1 from portfolio.projects where id = project_id) then
    raise exception 'project % not found', project_id using errcode = 'P0002';
  end if;

  if vote_type = 'like' then
    return query update portfolio.projects set likes = likes + 1 where id = project_id returning likes, dislikes;
  else
    return query update portfolio.projects set dislikes = dislikes + 1 where id = project_id returning likes, dislikes;
  end if;
end;
$$;

revoke all on function portfolio.increment_project_vote(uuid, text) from public;
grant execute on function portfolio.increment_project_vote(uuid, text) to anon, authenticated;

-- ============================================================================
-- Post-Migration Steps (run in the Supabase dashboard or via app)
-- ============================================================================
--
-- 1. Update .env.local in the app to point to the new Supabase project:
--    NEXT_PUBLIC_SUPABASE_URL=https://dcnmoqfjamzcopyujobd.supabase.co
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
--    SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
--
-- 2. Restart the app dev server (npm run dev)
--
-- 3. Verify the schema is created:
--    - Go to https://dcnmoqfjamzcopyujobd.supabase.co/editor/schemas/portfolio
--    - Confirm tables appear under the "portfolio" schema (not public)
--
-- 4. Test the admin login at http://localhost:3000/admin/login using:
--    Email: abiolaoyedele55@gmail.com
--    Password: <your-supabase-password>
--
-- 5. Once logged in, visit http://localhost:3000/admin/dashboard and create
--    a test project to confirm writes work through the RLS policy.
--
-- ============================================================================

-- ============================================================================
-- Migration: per-project "Tools + Tech" and "Scope" metadata (graphics detail
-- panel). Two text[] columns, mirroring the existing `tags`/`images` array
-- columns. Idempotent — safe to re-run against the live project.
--
-- THIS BLOCK MUST BE RUN MANUALLY IN THE SUPABASE SQL EDITOR (no automated
-- migration runner exists — see header note).
-- ============================================================================
alter table portfolio.projects
  add column if not exists tools text[],
  add column if not exists scope text[];
