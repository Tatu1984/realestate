import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get stats
    const [
      totalProperties,
      activeProperties,
      totalViews,
      totalInquiries,
      favorites,
      recentProperties,
      recentInquiries,
    ] = await Promise.all([
      prisma.property.count({ where: { userId } }),
      prisma.property.count({ where: { userId, status: "ACTIVE" } }),
      prisma.property.aggregate({
        where: { userId },
        _sum: { views: true },
      }),
      prisma.inquiry.count({ where: { receiverId: userId } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.property.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          views: true,
          price: true,
        },
      }),
      prisma.inquiry.findMany({
        where: { receiverId: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          property: {
            select: { title: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalProperties,
        activeProperties,
        totalViews: totalViews._sum.views || 0,
        totalInquiries,
        favorites,
      },
      recentProperties,
      recentInquiries,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
