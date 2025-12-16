import { NextResponse } from 'next/server'
import { logger } from './logger'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Maximum requests per window
  message?: string
}

// Preset configurations for different endpoints
export const rateLimitConfigs = {
  // Strict rate limiting for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later',
  },
  // Standard API rate limiting
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests, please try again later',
  },
  // Stricter for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many requests for this operation, please try again later',
  },
  // Contact form / inquiry rate limiting
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many submissions, please try again later',
  },
} as const

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 1000) // Clean up every minute

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier

  let entry = rateLimitStore.get(key)

  // If no entry or window has passed, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++

  // Check if over limit
  if (entry.count > config.maxRequests) {
    logger.security('Rate limit exceeded', { identifier, count: entry.count })
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

export function createRateLimitResponse(
  resetTime: number,
  message: string = 'Too many requests'
): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  )
}

// Helper to check rate limit and return response if exceeded
export function checkRateLimit(
  request: Request,
  configKey: keyof typeof rateLimitConfigs,
  customIdentifier?: string
): NextResponse | null {
  const config = rateLimitConfigs[configKey]
  const ip = getClientIp(request)
  const identifier = customIdentifier || `${configKey}:${ip}`

  const result = rateLimit(identifier, config)

  if (!result.success) {
    return createRateLimitResponse(result.resetTime, config.message)
  }

  return null
}

// Middleware-style rate limiter
export function withRateLimit(
  configKey: keyof typeof rateLimitConfigs
) {
  return function rateLimitMiddleware(
    request: Request
  ): { response: NextResponse | null; headers: Record<string, string> } {
    const config = rateLimitConfigs[configKey]
    const ip = getClientIp(request)
    const identifier = `${configKey}:${ip}`

    const result = rateLimit(identifier, config)

    const headers: Record<string, string> = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    }

    if (!result.success) {
      return {
        response: createRateLimitResponse(result.resetTime, config.message),
        headers,
      }
    }

    return { response: null, headers }
  }
}
