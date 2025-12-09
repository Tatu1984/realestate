import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon, image, parentId, isActive, order } = body

    const slug = name.toLowerCase().replace(/\s+/g, "-")

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        image,
        parentId,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
