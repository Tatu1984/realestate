import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, designation, company, content, rating, image, isActive } = body

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        designation,
        company,
        content,
        rating: rating ?? 5,
        image,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ testimonial })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}
