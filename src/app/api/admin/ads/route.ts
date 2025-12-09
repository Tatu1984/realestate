import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ads = await prisma.advertisement.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 })
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

    const ad = await prisma.advertisement.create({
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

    return NextResponse.json({ ad })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 })
  }
}
