import type { NextRequest } from 'next/server'

import { updateSession } from '@/middleware/session'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ['/admin/:path*'],
}
