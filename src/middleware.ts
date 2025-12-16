import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://")
const cookieName = useSecureCookies
  ? "__Secure-authjs.session-token"
  : "authjs.session-token"

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/favorites',
  '/my-properties',
  '/my-inquiries',
]

// Routes that require admin access
const adminRoutes = [
  '/admin',
]

// Public API routes (no auth required)
const publicApiRoutes = [
  '/api/auth',
  '/api/properties',
  '/api/projects',
  '/api/agents',
  '/api/builders',
  '/api/contact',
  '/api/newsletter',
]

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
}

// CSRF token validation for non-GET requests
function validateCsrf(request: NextRequest): boolean {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true
  }

  // For API routes, check Origin/Referer headers
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (!host) {
    return false
  }

  // Allow requests from same origin
  if (origin) {
    const originUrl = new URL(origin)
    return originUrl.host === host
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer)
      return refererUrl.host === host
    } catch {
      return false
    }
  }

  // Allow requests without Origin/Referer (e.g., from API clients with proper auth)
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add security headers to all responses
  const response = NextResponse.next()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Content Security Policy (less restrictive for development)
  const csp = process.env.NODE_ENV === 'production'
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';"
    : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' http: https: ws: wss:; frame-ancestors 'self';"
  response.headers.set('Content-Security-Policy', csp)

  // CSRF protection for API routes
  if (pathname.startsWith('/api/') && !validateCsrf(request)) {
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403 }
    )
  }

  // Check if accessing admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, cookieName })

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (token.userType !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Check if accessing protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, cookieName })

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check admin API routes
  if (pathname.startsWith('/api/admin/')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, cookieName })

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (token.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
  }

  // Protected API routes (require authentication)
  const protectedApiPatterns = [
    '/api/favorites',
    '/api/inquiries',
    '/api/users/dashboard',
  ]

  if (protectedApiPatterns.some(pattern => pathname.startsWith(pattern))) {
    // Allow GET requests to some endpoints for public access
    if (request.method !== 'GET' || pathname === '/api/favorites') {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, cookieName })

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
