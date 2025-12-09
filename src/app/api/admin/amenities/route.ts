import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const amenities = await prisma.amenity.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ amenities })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch amenities" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, icon, category, isActive } = body

    const amenity = await prisma.amenity.create({
      data: {
        name,
        icon,
        category,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ amenity })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create amenity" }, { status: 500 })
  }
}
