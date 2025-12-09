import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const images = await prisma.defaultImage.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, url, isActive } = body

    const image = await prisma.defaultImage.create({
      data: {
        name,
        type,
        url,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create image" }, { status: 500 })
  }
}
