import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Next.js 16 renamed `middleware` to `proxy`. This is the single gate in front
// of the whole /admin area. It must verify the `role: 'admin'` JWT claim — not
// merely that a user is signed in — because customers sign in through the same
// Supabase Auth instance, so "is signed in" is not the same as "is an admin".
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  // An admin is recognised by the `role: 'admin'` JWT claim (set on the admin
  // account) or by an allow-listed email in ADMIN_EMAILS. Both are checked
  // server-side; the email fallback keeps a single-owner store working even if
  // the metadata claim hasn't been set yet.
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  const isAdmin =
    user?.user_metadata?.role === 'admin' ||
    (!!user?.email && adminEmails.includes(user.email.toLowerCase()))

  // Not signed in: only the login page is reachable.
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // Signed in but NOT an admin (i.e. a customer account): block the entire
  // admin area. The login page is still allowed so they can sign in with the
  // admin account instead of being bounced between two redirects forever.
  if (user && !isAdmin && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // An admin who is already signed in never needs the login form.
  if (isAdmin && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
