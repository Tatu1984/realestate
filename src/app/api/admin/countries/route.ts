import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ countries })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, phoneCode, isActive } = body

    const country = await prisma.country.create({
      data: {
        name,
        code,
        phoneCode,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ country })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create country" }, { status: 500 })
  }
}
