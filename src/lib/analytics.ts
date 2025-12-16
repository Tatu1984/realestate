import prisma from './prisma'
import { logger } from './logger'
import { getRedis } from './redis'

// Track property view
export async function trackPropertyView(
  propertyId: string,
  userId?: string,
  sessionId?: string,
  metadata?: {
    referrer?: string
    userAgent?: string
    ip?: string
  }
): Promise<void> {
  try {
    // Increment view count in database
    await prisma.property.update({
      where: { id: propertyId },
      data: { views: { increment: 1 } },
    })

    // Store detailed analytics if we have more context
    if (userId || sessionId) {
      await prisma.propertyView.create({
        data: {
          propertyId,
          userId,
          sessionId,
          referrer: metadata?.referrer,
          userAgent: metadata?.userAgent,
          ipAddress: metadata?.ip,
        },
      })
    }

    // Update real-time view count in Redis if available
    const redis = getRedis()
    if (redis) {
      const key = `property:views:${propertyId}`
      await redis.incr(key)
      // Set TTL of 24 hours for real-time counts
      await redis.expire(key, 86400)
    }

    logger.debug('Property view tracked', { propertyId, userId })
  } catch (error) {
    logger.error('Failed to track property view', error)
  }
}

// Track search query
export async function trackSearch(
  query: string,
  filters: Record<string, unknown>,
  resultCount: number,
  userId?: string
): Promise<void> {
  try {
    await prisma.searchAnalytics.create({
      data: {
        query,
        filters: JSON.stringify(filters),
        resultCount,
        userId,
      },
    })

    logger.debug('Search tracked', { query, resultCount })
  } catch (error) {
    logger.error('Failed to track search', error)
  }
}

// Track user engagement
export async function trackEngagement(
  type: 'inquiry' | 'favorite' | 'share' | 'contact' | 'call',
  propertyId: string,
  userId?: string
): Promise<void> {
  try {
    await prisma.engagement.create({
      data: {
        type,
        propertyId,
        userId,
      },
    })

    logger.debug('Engagement tracked', { type, propertyId })
  } catch (error) {
    logger.error('Failed to track engagement', error)
  }
}

// Get property analytics
export async function getPropertyAnalytics(
  propertyId: string,
  days: number = 30
): Promise<{
  totalViews: number
  uniqueViews: number
  inquiries: number
  favorites: number
  shares: number
  viewsByDay: { date: string; count: number }[]
}> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    const [property, views, engagements] = await Promise.all([
      prisma.property.findUnique({
        where: { id: propertyId },
        select: { views: true },
      }),
      prisma.propertyView.findMany({
        where: {
          propertyId,
          createdAt: { gte: startDate },
        },
        select: {
          userId: true,
          sessionId: true,
          createdAt: true,
        },
      }),
      prisma.engagement.groupBy({
        by: ['type'],
        where: {
          propertyId,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),
    ])

    // Calculate unique views
    const uniqueViewers = new Set(
      views.map((v) => v.userId || v.sessionId).filter(Boolean)
    )

    // Group views by day
    const viewsByDay: Record<string, number> = {}
    views.forEach((view) => {
      const date = view.createdAt.toISOString().split('T')[0]
      viewsByDay[date] = (viewsByDay[date] || 0) + 1
    })

    // Convert engagement array to object
    const engagementCounts: Record<string, number> = {}
    engagements.forEach((e) => {
      engagementCounts[e.type] = e._count
    })

    return {
      totalViews: property?.views || 0,
      uniqueViews: uniqueViewers.size,
      inquiries: engagementCounts['inquiry'] || 0,
      favorites: engagementCounts['favorite'] || 0,
      shares: engagementCounts['share'] || 0,
      viewsByDay: Object.entries(viewsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }
  } catch (error) {
    logger.error('Failed to get property analytics', error)
    return {
      totalViews: 0,
      uniqueViews: 0,
      inquiries: 0,
      favorites: 0,
      shares: 0,
      viewsByDay: [],
    }
  }
}

// Get user dashboard analytics
export async function getUserAnalytics(userId: string): Promise<{
  totalProperties: number
  activeListings: number
  totalViews: number
  totalInquiries: number
  recentViews: { propertyId: string; title: string; views: number }[]
  performanceByProperty: {
    id: string
    title: string
    views: number
    inquiries: number
    favorites: number
  }[]
}> {
  try {
    const [properties, inquiries, engagements] = await Promise.all([
      prisma.property.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          views: true,
          status: true,
        },
      }),
      prisma.propertyInquiry.count({
        where: {
          property: { userId },
        },
      }),
      prisma.engagement.groupBy({
        by: ['propertyId', 'type'],
        where: {
          property: { userId },
        },
        _count: true,
      }),
    ])

    // Build engagement map
    const engagementMap: Record<string, Record<string, number>> = {}
    engagements.forEach((e) => {
      if (!engagementMap[e.propertyId]) {
        engagementMap[e.propertyId] = {}
      }
      engagementMap[e.propertyId][e.type] = e._count
    })

    const totalViews = properties.reduce((sum, p) => sum + p.views, 0)
    const activeListings = properties.filter((p) => p.status === 'ACTIVE').length

    return {
      totalProperties: properties.length,
      activeListings,
      totalViews,
      totalInquiries: inquiries,
      recentViews: properties
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map((p) => ({
          propertyId: p.id,
          title: p.title,
          views: p.views,
        })),
      performanceByProperty: properties.map((p) => ({
        id: p.id,
        title: p.title,
        views: p.views,
        inquiries: engagementMap[p.id]?.['inquiry'] || 0,
        favorites: engagementMap[p.id]?.['favorite'] || 0,
      })),
    }
  } catch (error) {
    logger.error('Failed to get user analytics', error)
    return {
      totalProperties: 0,
      activeListings: 0,
      totalViews: 0,
      totalInquiries: 0,
      recentViews: [],
      performanceByProperty: [],
    }
  }
}

// Get trending properties
export async function getTrendingProperties(
  limit: number = 10
): Promise<{ id: string; title: string; views: number; trend: number }[]> {
  const redis = getRedis()

  try {
    // Get from cache if available
    if (redis) {
      const cached = await redis.get('trending:properties')
      if (cached) {
        return JSON.parse(cached)
      }
    }

    // Calculate trending based on recent views
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const recentViews = await prisma.propertyView.groupBy({
      by: ['propertyId'],
      where: {
        createdAt: { gte: oneDayAgo },
      },
      _count: true,
      orderBy: {
        _count: {
          propertyId: 'desc',
        },
      },
      take: limit,
    })

    const propertyIds = recentViews.map((v) => v.propertyId)
    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: { id: true, title: true, views: true },
    })

    const propertyMap = new Map(properties.map((p) => [p.id, p]))

    const trending = recentViews.map((v) => {
      const property = propertyMap.get(v.propertyId)
      return {
        id: v.propertyId,
        title: property?.title || 'Unknown',
        views: property?.views || 0,
        trend: v._count,
      }
    })

    // Cache for 1 hour
    if (redis) {
      await redis.setex('trending:properties', 3600, JSON.stringify(trending))
    }

    return trending
  } catch (error) {
    logger.error('Failed to get trending properties', error)
    return []
  }
}

// Get platform-wide statistics
export async function getPlatformStats(): Promise<{
  totalProperties: number
  totalUsers: number
  totalAgents: number
  totalBuilders: number
  totalViews: number
  totalInquiries: number
  propertiesByCity: { city: string; count: number }[]
  propertiesByType: { type: string; count: number }[]
}> {
  try {
    const [
      totalProperties,
      totalUsers,
      totalAgents,
      totalBuilders,
      viewsSum,
      totalInquiries,
      propertiesByCity,
      propertiesByType,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.user.count(),
      prisma.user.count({ where: { userType: 'AGENT' } }),
      prisma.user.count({ where: { userType: 'BUILDER' } }),
      prisma.property.aggregate({ _sum: { views: true } }),
      prisma.propertyInquiry.count(),
      prisma.property.groupBy({
        by: ['city'],
        _count: true,
        orderBy: { _count: { city: 'desc' } },
        take: 10,
      }),
      prisma.property.groupBy({
        by: ['propertyType'],
        _count: true,
        orderBy: { _count: { propertyType: 'desc' } },
      }),
    ])

    return {
      totalProperties,
      totalUsers,
      totalAgents,
      totalBuilders,
      totalViews: viewsSum._sum.views || 0,
      totalInquiries,
      propertiesByCity: propertiesByCity.map((c) => ({
        city: c.city,
        count: c._count,
      })),
      propertiesByType: propertiesByType.map((t) => ({
        type: t.propertyType,
        count: t._count,
      })),
    }
  } catch (error) {
    logger.error('Failed to get platform stats', error)
    return {
      totalProperties: 0,
      totalUsers: 0,
      totalAgents: 0,
      totalBuilders: 0,
      totalViews: 0,
      totalInquiries: 0,
      propertiesByCity: [],
      propertiesByType: [],
    }
  }
}
