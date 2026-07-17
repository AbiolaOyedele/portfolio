-- Supabase Schema for Abiola Portfolio
-- Run this in the Supabase SQL Editor
--
-- NOTE: This file is a reference/documentation copy of the schema, not wired
-- into an automated migration runner. There is no Supabase CLI migration
-- pipeline in this project (see docs/architecture.md and plan §10). Every
-- statement in this file — including the hardening block appended below —
-- must be run MANUALLY in the Supabase SQL editor against the live project.
-- No service-role/DB-admin credential is available to this tooling to run
-- schema or policy changes automatically.

-- Projects table
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  category    text not null check (category in ('graphics', 'motion', 'playground')),
  description text,
  cover_url   text,
  images      text[],
  video_url   text,
  tags        text[],
  visible     boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- About table (single row)
create table if not exists about (
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

-- Add subcategory column for Graphics subcategories
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subcategory text;

-- Row Level Security
alter table projects enable row level security;
alter table about enable row level security;

-- Public read access for visible projects
create policy "Public can read visible projects"
  on projects for select
  using (visible = true);

-- Authenticated users can do everything with projects
create policy "Admin full access to projects"
  on projects for all
  using (auth.role() = 'authenticated');

-- Public read access for about
create policy "Public can read about"
  on about for select
  using (true);

-- Authenticated users can do everything with about
create policy "Admin full access to about"
  on about for all
  using (auth.role() = 'authenticated');

-- Migration hardening: scope admin RLS to a single owner account
--
-- Gap fixed: the original policies above use `auth.role() = 'authenticated'`,
-- which grants full CRUD on `projects` and `about` to ANY signed-in Supabase
-- user, not just the site owner. The statements below replace those two
-- policies with checks scoped to a single hardcoded admin email
-- (abiolaoyedele55@gmail.com), matching the app-layer `requireAdminSession`
-- check in src/services/auth.service.ts (defense in depth — see
-- docs/architecture.md).
--
-- THIS BLOCK MUST BE RUN MANUALLY IN THE SUPABASE SQL EDITOR AGAINST THE
-- LIVE PROJECT BEFORE CUTOVER. It is documented here for review/history, not
-- executed by any automated migration tool in this repo.

create or replace function is_portfolio_admin()
returns boolean language sql security definer stable as $$
  select auth.jwt() ->> 'email' = 'abiolaoyedele55@gmail.com';
$$;

drop policy if exists "Admin full access to projects" on projects;
create policy "Admin full access to projects" on projects for all
  using (is_portfolio_admin()) with check (is_portfolio_admin());

drop policy if exists "Admin full access to about" on about;
create policy "Admin full access to about" on about for all
  using (is_portfolio_admin()) with check (is_portfolio_admin());

-- Graphics vote counters + safe public increment RPC
--
-- Adds two counters to `projects` for the swipe-to-vote feature on the
-- /graphics canvas. A plain public UPDATE RLS policy can't safely express
-- this: RLS predicates gate which ROWS a role may touch, not which columns,
-- so a public update policy would let any anonymous request set `likes` to
-- an arbitrary value (or touch `title`/`visible` in the same request), and
-- can't express an atomic "+1" (two concurrent votes could both read
-- likes=5 and both write likes=6, losing one). This SECURITY DEFINER
-- function fixes all three: it runs with the function owner's privileges
-- regardless of the caller's own grants, does one atomic
-- `set likes = likes + 1`, and validates vote_type before touching
-- anything. anon/authenticated get EXECUTE on this one narrow function —
-- never UPDATE on the table itself.
--
-- Return columns are named new_likes/new_dislikes, not likes/dislikes: a
-- function declared RETURNS TABLE(likes int, ...) implicitly creates an OUT
-- variable named `likes`, which collides with the table's own `likes`
-- column inside the function body (Postgres's default
-- plpgsql.variable_conflict = error throws "ambiguous column reference").
--
-- THIS BLOCK MUST BE RUN MANUALLY IN THE SUPABASE SQL EDITOR (see header
-- note at the top of this file — no automated migration runner exists).

alter table projects
  add column if not exists likes integer not null default 0 check (likes >= 0),
  add column if not exists dislikes integer not null default 0 check (dislikes >= 0);

create or replace function increment_project_vote(project_id uuid, vote_type text)
returns table(new_likes integer, new_dislikes integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if vote_type not in ('like', 'dislike') then
    raise exception 'invalid vote_type: %, expected ''like'' or ''dislike''', vote_type
      using errcode = '22023';
  end if;

  if not exists (select 1 from projects where id = project_id) then
    raise exception 'project % not found', project_id using errcode = 'P0002';
  end if;

  if vote_type = 'like' then
    return query update projects set likes = likes + 1 where id = project_id returning likes, dislikes;
  else
    return query update projects set dislikes = dislikes + 1 where id = project_id returning likes, dislikes;
  end if;
end;
$$;

-- Postgres grants EXECUTE to the PUBLIC pseudo-role by default on function
-- creation — revoke that first, then grant explicitly to only the two
-- roles that need it.
revoke all on function increment_project_vote(uuid, text) from public;
grant execute on function increment_project_vote(uuid, text) to anon, authenticated;

-- ============================================================================
-- Migration: per-project "Tools + Tech" and "Scope" metadata (graphics detail
-- panel). Reference/documentation copy — run in the Supabase SQL editor.
-- ============================================================================
alter table projects
  add column if not exists tools text[],
  add column if not exists scope text[];
