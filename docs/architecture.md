# Architecture

## Layering

Requests flow in one direction only — never skip a layer:

```
Routes / Server Components / Server Actions
        → Services   (business logic, validation, error translation)
            → Repositories   (Supabase queries only, no logic)
                → Supabase
```

- **Routes/Server Components** call **services only** — never repositories, never a Supabase client directly.
- **Services** hold all business logic (placeholder fallback for public reads, Zod validation, `AppError` translation) and call repositories.
- **Repositories** (`src/repositories/*.repository.ts`) contain the only Supabase queries in the codebase — nothing else lives there.
- **Components** never query the database directly.

## Auth enforcement (defense in depth, three layers)

1. **Middleware** (`src/middleware.ts` + `src/middleware/session.ts`) — route-level gating. Every `/admin/*` request except `/admin/login` refreshes the session and checks `user.email === env.ADMIN_EMAIL`, redirecting to `/admin/login` otherwise. Runs before any protected page renders.
2. **`requireAdminSession()`** (`src/services/auth.service.ts`) — called at the top of every mutating Server Action, independent of middleware. Throws `AppError(403, ...)` on any session that isn't the site owner.
3. **RLS at the database** — the last line of defense. Even if the above layers were bypassed or misconfigured, Postgres row-level security policies scope all `projects`/`about` writes to the single admin account.

See `supabase/schema.sql` for the actual RLS policies — that file is the source of truth and must be run manually in the Supabase SQL editor; it is not wired into an automated migration runner.
