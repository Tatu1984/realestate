import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isRedisAvailable } from '@/lib/redis'
import { logger } from '@/lib/logger'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: {
      status: 'up' | 'down'
      latency?: number
    }
    redis: {
      status: 'up' | 'down' | 'not_configured'
      latency?: number
    }
    memory: {
      used: number
      total: number
      percentage: number
    }
  }
}

const startTime = Date.now()

export async function GET() {
  const checks: HealthStatus['checks'] = {
    database: { status: 'down' },
    redis: { status: 'not_configured' },
    memory: { used: 0, total: 0, percentage: 0 },
  }

  let overallStatus: HealthStatus['status'] = 'healthy'

  // Check database
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    checks.database = {
      status: 'up',
      latency: Date.now() - dbStart,
    }
  } catch (error) {
    logger.error('Health check: Database failed', error)
    checks.database = { status: 'down' }
    overallStatus = 'unhealthy'
  }

  // Check Redis
  try {
    const redisStart = Date.now()
    const redisUp = await isRedisAvailable()

    if (redisUp) {
      checks.redis = {
        status: 'up',
        latency: Date.now() - redisStart,
      }
    } else if (process.env.REDIS_URL) {
      checks.redis = { status: 'down' }
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus
    } else {
      checks.redis = { status: 'not_configured' }
    }
  } catch (error) {
    logger.error('Health check: Redis failed', error)
    checks.redis = { status: 'down' }
    overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus
  }

  // Check memory
  try {
    const memUsage = process.memoryUsage()
    checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    }

    // Warn if memory usage is high
    if (checks.memory.percentage > 90) {
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus
      logger.warn('Health check: High memory usage', checks.memory)
    }
  } catch (error) {
    logger.error('Health check: Memory check failed', error)
  }

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.round((Date.now() - startTime) / 1000), // seconds
    checks,
  }

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}

// Kubernetes/Docker liveness probe
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
