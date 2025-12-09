import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type, placement, startDate, endDate, isActive } = body

    const alert = await prisma.alert.create({
      data: {
        title,
        message,
        type: type ?? "INFO",
        placement: placement ?? "TOP_BANNER",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}
