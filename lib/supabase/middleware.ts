import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => { response.cookies.set(name, value, options) }) } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const protectedPath = request.nextUrl.pathname.startsWith('/app') || request.nextUrl.pathname.startsWith('/admin')
  if (protectedPath && !user) return NextResponse.redirect(new URL('/login', request.url))
  return response
}
