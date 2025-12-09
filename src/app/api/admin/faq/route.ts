import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const faqs = await prisma.fAQ.findMany({
      orderBy: { order: "asc" },
    })
    return NextResponse.json({ faqs })
  } catch (error) {
    console.error("Error fetching FAQs:", error)
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

    // Get max order
    const maxOrder = await prisma.fAQ.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const faq = await prisma.fAQ.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category || null,
        isActive: body.isActive ?? true,
        order: (maxOrder?.order || 0) + 1,
      },
    })

    return NextResponse.json({ faq })
  } catch (error) {
    console.error("Error creating FAQ:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
