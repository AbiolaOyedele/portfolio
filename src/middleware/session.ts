import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { env } from '@/config/env'

/**
 * Refreshes the Supabase session on every request and enforces the admin
 * gate on `/admin/*` routes (except `/admin/login`): only the configured
 * `ADMIN_EMAIL` may pass. Everyone else is redirected to `/admin/login`.
 *
 * This is defense-in-depth alongside RLS/`requireAdminSession` — it runs
 * before any protected page renders.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  const user = data.user

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAdminLoginRoute = request.nextUrl.pathname.startsWith('/admin/login')

  if (isAdminRoute && !isAdminLoginRoute && user?.email !== env.ADMIN_EMAIL) {
    const redirectUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
