import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, image, link, position, startDate, endDate, isActive } = body

    const banner = await prisma.banner.create({
      data: {
        title,
        image,
        link,
        position,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ banner })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 })
  }
}
