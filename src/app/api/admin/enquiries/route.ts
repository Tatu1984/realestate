import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inquiries = await prisma.inquiry.findMany({
      include: {
        property: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error("Error fetching inquiries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
