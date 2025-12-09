import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const localities = await prisma.locality.findMany({
      include: {
        city: { select: { id: true, name: true, state: true } },
      },
      orderBy: { name: "asc" },
    })

    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ localities, cities })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch localities" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, cityId, pincode } = body

    const locality = await prisma.locality.create({
      data: {
        name,
        cityId,
        pincode,
      },
      include: {
        city: { select: { id: true, name: true, state: true } },
      },
    })

    return NextResponse.json({ locality })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create locality" }, { status: 500 })
  }
}
