# Migration to New Supabase Project

This guide walks through migrating the portfolio from the old (unreachable) Supabase project to a new shared instance.

**New Supabase Project:** `https://dcnmoqfjamzcopyujobd.supabase.co`

---

## Step 1: Get the Supabase Credentials

1. Open the Supabase dashboard: https://dcnmoqfjamzcopyujobd.supabase.co
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (should be `https://dcnmoqfjamzcopyujobd.supabase.co`)
   - **Anon key** (public key, safe to use in frontend)
   - **Service role key** (secret, keep it safe — only for backend/server operations)

---

## Step 2: Update `.env.local`

Replace the old credentials with the new ones in `/Users/abiola/Claude/portfolio-next/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dcnmoqfjamzcopyujobd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-your-anon-key-here>
SUPABASE_SERVICE_ROLE_KEY=<paste-your-service-role-key-here>
ADMIN_EMAIL=abiolaoyedele55@gmail.com
SENTRY_DSN=
```

---

## Step 3: Create the Portfolio Schema in Supabase

1. Open the Supabase dashboard: https://dcnmoqfjamzcopyujobd.supabase.co
2. Go to the **SQL Editor** (left sidebar)
3. Click **New Query** (or paste into an existing one)
4. Copy the **entire contents** of [`supabase/schema-isolated.sql`](./supabase/schema-isolated.sql)
5. Paste it into the SQL editor
6. Click **Run** (the big play button)

This creates:
- A `portfolio` schema (isolated namespace to avoid conflicts with other products)
- `portfolio.projects` table (all project metadata)
- `portfolio.about` table (single-row portfolio bio)
- Row-level security (RLS) policies that gate writes to your admin email only
- The `is_portfolio_admin()` function for defense-in-depth authorization

---

## Step 4: Verify the Schema

After running the SQL:

1. In the Supabase dashboard, go to the **SQL Editor** tab
2. Run this query to confirm the tables exist:
   ```sql
   select table_name 
   from information_schema.tables 
   where table_schema = 'portfolio';
   ```
   You should see:
   - `portfolio.about`
   - `portfolio.projects`

3. Optionally, view the schema visually in the **Database** → **Schemas** section (select `portfolio` from the dropdown)

---

## Step 4.5: Expose the `portfolio` schema to the API (required, easy to miss)

Supabase's data API (PostgREST) only serves schemas that are explicitly allow-listed —
by default just `public` and `graphql_public`. The app queries via
`client.schema('portfolio').from(...)`, so until `portfolio` is added to this list,
every request fails with `PGRST106: Invalid schema: portfolio` even though the schema
and tables exist and the credentials are correct. Confirmed by hitting the live app
against real credentials: connection succeeded, Postgrest responded, and this was the
exact error returned.

1. In the Supabase dashboard, go to **Settings** → **API**
2. Find **Data API settings** → **Exposed schemas**
3. Add `portfolio` to the list (alongside the existing `public`, `graphql_public`)
4. Save

No restart needed on the app side — this takes effect immediately on Supabase's end.

---

## Step 5: Restart the Dev Server

1. Stop the running dev server (Ctrl+C in the terminal)
2. Restart it:
   ```bash
   cd /Users/abiola/Claude/portfolio-next
   npm run dev
   ```
3. The app should now connect to the new Supabase project

---

## Step 6: Test the Admin Login

1. Open http://localhost:3000/admin/login in your browser
2. Log in with:
   - **Email:** `abiolaoyedele55@gmail.com`
   - **Password:** Your Supabase password (set when you created the project, or reset it in Settings → Auth)

3. If login succeeds, you should see the `/admin/dashboard`

---

## Step 7: Create a Test Project (Optional)

1. While logged in at `/admin/dashboard`, click **"Create project"** (or similar)
2. Fill in some test data:
   - **Title:** "Test Project"
   - **Slug:** `test-project`
   - **Category:** "graphics"
   - **Description:** "Testing the new database"
3. Click **Save**
4. If it saves without errors, the RLS policy is working correctly ✓

---

## Step 8: Verify Public Routes

1. Log out or open an incognito window
2. Visit http://localhost:3000/graphics (or any public route)
3. The app should still render (either with your test project or with placeholder data if the table is empty)

---

## Notes

- **Why the `portfolio` schema?** The new Supabase project is shared with another product. Using a dedicated schema (`portfolio`) keeps your data completely isolated from any other tables that might exist in the `public` schema.
- **What changed in the code?** All database queries now reference `portfolio.projects` and `portfolio.about` instead of just `projects` and `about`. This is handled transparently — no changes needed to your page code.
- **If something breaks:** Check the Supabase dashboard → **Settings** → **Logs** for any SQL errors. Most issues are either missing credentials or incorrect table names.

---

## Rollback (If Needed)

If you want to revert to the old Supabase project (or switch projects again):

1. Update `.env.local` with the old/different credentials
2. Restart `npm run dev`

That's it — no code changes needed.
