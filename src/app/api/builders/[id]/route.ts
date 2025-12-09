import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const builder = await prisma.builderProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    if (!builder) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 })
    }

    // Get projects by this builder
    const projects = await prisma.project.findMany({
      where: { builderId: id },
      select: {
        id: true,
        name: true,
        status: true,
        location: true,
        city: true,
        priceRange: true,
        totalUnits: true,
        availableUnits: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ builder, projects })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch builder" }, { status: 500 })
  }
}
