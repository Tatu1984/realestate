import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [featuredAgents, featuredBuilders, featuredBuyers, featuredSellers] = await Promise.all([
      prisma.agentProfile.findMany({
        where: { isFeatured: true },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      }),
      prisma.builderProfile.findMany({
        where: { isFeatured: true },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      }),
      prisma.user.findMany({
        where: { userType: "INDIVIDUAL" },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          userType: "INDIVIDUAL",
          properties: { some: { listingType: "SELL" } }
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalAgents: featuredAgents.length,
        totalBuilders: featuredBuilders.length,
        totalBuyers: featuredBuyers.length,
        totalSellers: featuredSellers.length,
      },
      featuredAgents,
      featuredBuilders,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch featured data" }, { status: 500 })
  }
}
