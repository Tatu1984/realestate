import type { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

// Force dynamic generation at runtime
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Skip database queries if DATABASE_URL is not set (during build)
  if (!process.env.DATABASE_URL) {
    return []
  }
  const baseUrl = process.env.NEXTAUTH_URL || 'https://propestate.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/builders`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/loans`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // Dynamic pages - Properties
  let propertyPages: MetadataRoute.Sitemap = []
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, updatedAt: true },
      take: 1000, // Limit for sitemap size
      orderBy: { updatedAt: 'desc' },
    })

    propertyPages = properties.map((property) => ({
      url: `${baseUrl}/property/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error generating property sitemap:', error)
  }

  // Dynamic pages - Projects
  let projectPages: MetadataRoute.Sitemap = []
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, updatedAt: true },
      take: 500,
      orderBy: { updatedAt: 'desc' },
    })

    projectPages = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: project.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error generating project sitemap:', error)
  }

  // Dynamic pages - News
  let newsPages: MetadataRoute.Sitemap = []
  try {
    const news = await prisma.news.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      take: 500,
      orderBy: { publishedAt: 'desc' },
    })

    newsPages = news.map((article) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch (error) {
    console.error('Error generating news sitemap:', error)
  }

  // Dynamic pages - Agents
  let agentPages: MetadataRoute.Sitemap = []
  try {
    const agents = await prisma.agentProfile.findMany({
      select: { id: true, updatedAt: true },
      take: 500,
    })

    agentPages = agents.map((agent) => ({
      url: `${baseUrl}/agents/${agent.id}`,
      lastModified: agent.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error generating agent sitemap:', error)
  }

  // Dynamic pages - Builders
  let builderPages: MetadataRoute.Sitemap = []
  try {
    const builders = await prisma.builderProfile.findMany({
      select: { id: true, updatedAt: true },
      take: 500,
    })

    builderPages = builders.map((builder) => ({
      url: `${baseUrl}/builders/${builder.id}`,
      lastModified: builder.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error generating builder sitemap:', error)
  }

  // Dynamic pages - CMS Pages
  let cmsPages: MetadataRoute.Sitemap = []
  try {
    const pages = await prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    })

    cmsPages = pages.map((page) => ({
      url: `${baseUrl}/page/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }))
  } catch (error) {
    console.error('Error generating CMS pages sitemap:', error)
  }

  return [
    ...staticPages,
    ...propertyPages,
    ...projectPages,
    ...newsPages,
    ...agentPages,
    ...builderPages,
    ...cmsPages,
  ]
}
