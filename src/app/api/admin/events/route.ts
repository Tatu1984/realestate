import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, location, startDate, endDate, image, link, isActive } = body

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        image,
        link,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
