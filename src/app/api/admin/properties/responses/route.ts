import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const responses = await prisma.propertyResponse.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ responses })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 })
  }
}
