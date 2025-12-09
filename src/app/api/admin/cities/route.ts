import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cities = await prisma.city.findMany({
      include: {
        _count: { select: { localities: true } },
      },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ cities })
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const city = await prisma.city.create({
      data: {
        name: body.name,
        state: body.state,
        isPopular: body.isPopular ?? false,
        image: body.image,
      },
    })

    return NextResponse.json({ city })
  } catch (error) {
    console.error("Error creating city:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
