import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const property = await prisma.property.update({
      where: { id },
      data: { status: "ACTIVE" },
    })

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Error approving property:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
