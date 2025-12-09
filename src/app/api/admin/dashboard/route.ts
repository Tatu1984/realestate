import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      totalUsers,
      totalProperties,
      pendingProperties,
      activeProperties,
      totalInquiries,
      totalAgents,
      totalBuilders,
      totalMessages,
      recentProperties,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: "PENDING" } }),
      prisma.property.count({ where: { status: "ACTIVE" } }),
      prisma.inquiry.count(),
      prisma.agentProfile.count(),
      prisma.builderProfile.count(),
      prisma.contactMessage.count(),
      prisma.property.findMany({
        where: { status: "PENDING" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProperties,
        pendingProperties,
        activeProperties,
        totalInquiries,
        totalAgents,
        totalBuilders,
        totalMessages,
      },
      recentProperties,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    )
  }
}
