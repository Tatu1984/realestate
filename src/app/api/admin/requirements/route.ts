import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requirements = await prisma.requirement.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ requirements })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 })
  }
}
