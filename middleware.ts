import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Get the auth token from cookies
  const access_token = req.cookies.get('sb-access-token')?.value

  if (access_token) {
    // Attach the token to the Supabase client
    supabase.auth.setSession({
      access_token,
      refresh_token: req.cookies.get('sb-refresh-token')?.value || ''
    })
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|.\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)).)',
  ],
}