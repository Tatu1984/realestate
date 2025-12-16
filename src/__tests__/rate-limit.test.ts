import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store between tests by waiting
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rateLimit', () => {
    it('should allow requests within limit', () => {
      const config = { windowMs: 60000, maxRequests: 5 }
      const identifier = 'test-user-1'

      for (let i = 0; i < 5; i++) {
        const result = rateLimit(identifier, config)
        expect(result.success).toBe(true)
        expect(result.remaining).toBe(4 - i)
      }
    })

    it('should block requests over limit', () => {
      const config = { windowMs: 60000, maxRequests: 3 }
      const identifier = 'test-user-2'

      // Use up all requests
      for (let i = 0; i < 3; i++) {
        rateLimit(identifier, config)
      }

      // This should be blocked
      const result = rateLimit(identifier, config)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', () => {
      const config = { windowMs: 1000, maxRequests: 2 }
      const identifier = 'test-user-3'

      // Use up all requests
      rateLimit(identifier, config)
      rateLimit(identifier, config)
      expect(rateLimit(identifier, config).success).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(1100)

      // Should be allowed again
      const result = rateLimit(identifier, config)
      expect(result.success).toBe(true)
    })

    it('should track different identifiers separately', () => {
      const config = { windowMs: 60000, maxRequests: 2 }

      // User 1 uses their limit
      rateLimit('user-1', config)
      rateLimit('user-1', config)
      expect(rateLimit('user-1', config).success).toBe(false)

      // User 2 should still be allowed
      expect(rateLimit('user-2', config).success).toBe(true)
    })

    it('should return correct resetTime', () => {
      const config = { windowMs: 60000, maxRequests: 5 }
      const identifier = 'test-user-4'

      const result = rateLimit(identifier, config)
      expect(result.resetTime).toBeGreaterThan(Date.now())
      expect(result.resetTime).toBeLessThanOrEqual(Date.now() + 60000)
    })
  })

  describe('rateLimitConfigs', () => {
    it('should have auth config for authentication endpoints', () => {
      expect(rateLimitConfigs.auth).toBeDefined()
      expect(rateLimitConfigs.auth.maxRequests).toBeLessThanOrEqual(10)
    })

    it('should have api config for general API endpoints', () => {
      expect(rateLimitConfigs.api).toBeDefined()
      expect(rateLimitConfigs.api.maxRequests).toBeGreaterThanOrEqual(30)
    })

    it('should have contact config for contact forms', () => {
      expect(rateLimitConfigs.contact).toBeDefined()
      expect(rateLimitConfigs.contact.windowMs).toBeGreaterThanOrEqual(60 * 60 * 1000) // At least 1 hour
    })

    it('should have sensitive config for sensitive operations', () => {
      expect(rateLimitConfigs.sensitive).toBeDefined()
      expect(rateLimitConfigs.sensitive.maxRequests).toBeLessThanOrEqual(10)
    })
  })
})
