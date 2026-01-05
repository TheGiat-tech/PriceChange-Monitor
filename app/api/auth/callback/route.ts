import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback] Session exchange error:', {
        error: error.message,
        code: error.status,
      })
      // Redirect to login on error
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
