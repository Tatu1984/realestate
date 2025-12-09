import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const agent = await prisma.agentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get properties listed by this agent
    const properties = await prisma.property.findMany({
      where: {
        userId: agent.userId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        price: true,
        propertyType: true,
        listingType: true,
        locality: true,
        city: true,
        bedrooms: true,
        bathrooms: true,
        builtUpArea: true,
        images: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ agent, properties })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 })
  }
}
