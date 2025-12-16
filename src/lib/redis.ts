import Redis from 'ioredis'
import { logger } from './logger'

// Redis client singleton
let redis: Redis | null = null

// Initialize Redis connection
function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    logger.info('Redis URL not configured, using in-memory rate limiting')
    return null
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        // Retry with exponential backoff, max 3 seconds
        return Math.min(times * 100, 3000)
      },
    })

    client.on('connect', () => {
      logger.info('Redis connected')
    })

    client.on('error', (error) => {
      logger.error('Redis error', error)
    })

    client.on('close', () => {
      logger.warn('Redis connection closed')
    })

    return client
  } catch (error) {
    logger.error('Failed to create Redis client', error)
    return null
  }
}

// Get Redis client (lazy initialization)
export function getRedis(): Redis | null {
  if (!redis) {
    redis = createRedisClient()
  }
  return redis
}

// Check if Redis is available
export async function isRedisAvailable(): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  try {
    await client.ping()
    return true
  } catch {
    return false
  }
}

// Rate limiting with Redis
interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export async function redisRateLimit(
  identifier: string,
  windowMs: number,
  maxRequests: number
): Promise<RateLimitResult | null> {
  const client = getRedis()
  if (!client) return null

  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = now - windowMs

  try {
    // Use Redis transaction for atomic operations
    const multi = client.multi()

    // Remove old entries outside the window
    multi.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    multi.zcard(key)

    // Add current request
    multi.zadd(key, now, `${now}-${Math.random()}`)

    // Set expiry on the key
    multi.pexpire(key, windowMs)

    const results = await multi.exec()

    if (!results) {
      return null
    }

    const currentCount = (results[1]?.[1] as number) || 0

    if (currentCount >= maxRequests) {
      // Get the oldest request time to calculate reset
      const oldest = await client.zrange(key, 0, 0, 'WITHSCORES')
      const resetTime = oldest.length >= 2 ? parseInt(oldest[1]) + windowMs : now + windowMs

      return {
        success: false,
        remaining: 0,
        resetTime,
      }
    }

    return {
      success: true,
      remaining: maxRequests - currentCount - 1,
      resetTime: now + windowMs,
    }
  } catch (error) {
    logger.error('Redis rate limit error', error)
    return null
  }
}

// Cache operations
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null

  try {
    const value = await client.get(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch (error) {
    logger.error('Cache get error', error)
    return null
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  try {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized)
    } else {
      await client.set(key, serialized)
    }
    return true
  } catch (error) {
    logger.error('Cache set error', error)
    return false
  }
}

export async function cacheDelete(key: string): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  try {
    await client.del(key)
    return true
  } catch (error) {
    logger.error('Cache delete error', error)
    return false
  }
}

export async function cacheDeletePattern(pattern: string): Promise<number> {
  const client = getRedis()
  if (!client) return 0

  try {
    const keys = await client.keys(pattern)
    if (keys.length === 0) return 0
    return await client.del(...keys)
  } catch (error) {
    logger.error('Cache delete pattern error', error)
    return 0
  }
}

// Session storage
export async function setSession(
  sessionId: string,
  data: Record<string, unknown>,
  ttlSeconds: number = 86400 // 24 hours
): Promise<boolean> {
  return cacheSet(`session:${sessionId}`, data, ttlSeconds)
}

export async function getSession<T>(sessionId: string): Promise<T | null> {
  return cacheGet<T>(`session:${sessionId}`)
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  return cacheDelete(`session:${sessionId}`)
}

// Pub/Sub for real-time features
export async function publish(channel: string, message: unknown): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  try {
    await client.publish(channel, JSON.stringify(message))
    return true
  } catch (error) {
    logger.error('Publish error', error)
    return false
  }
}

export function subscribe(
  channel: string,
  callback: (message: unknown) => void
): (() => void) | null {
  const client = getRedis()
  if (!client) return null

  const subscriber = client.duplicate()

  subscriber.subscribe(channel, (err) => {
    if (err) {
      logger.error('Subscribe error', err)
    }
  })

  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      try {
        callback(JSON.parse(message))
      } catch {
        callback(message)
      }
    }
  })

  // Return unsubscribe function
  return () => {
    subscriber.unsubscribe(channel)
    subscriber.quit()
  }
}

// Distributed lock
export async function acquireLock(
  lockName: string,
  ttlMs: number = 30000
): Promise<string | null> {
  const client = getRedis()
  if (!client) return null

  const lockKey = `lock:${lockName}`
  const lockValue = `${Date.now()}-${Math.random()}`

  try {
    const result = await client.set(lockKey, lockValue, 'PX', ttlMs, 'NX')
    return result === 'OK' ? lockValue : null
  } catch (error) {
    logger.error('Acquire lock error', error)
    return null
  }
}

export async function releaseLock(lockName: string, lockValue: string): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  const lockKey = `lock:${lockName}`

  try {
    // Only release if we own the lock
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `
    const result = await client.eval(script, 1, lockKey, lockValue)
    return result === 1
  } catch (error) {
    logger.error('Release lock error', error)
    return false
  }
}

// Cleanup on shutdown
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
    logger.info('Redis connection closed')
  }
}
