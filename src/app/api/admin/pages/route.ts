import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, metaTitle, metaDescription, isPublished } = body

    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
        isPublished: isPublished ?? false,
      },
    })

    return NextResponse.json({ page })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 })
  }
}
