import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currencies = await prisma.currency.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ currencies })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, symbol, isDefault, isActive } = body

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.currency.updateMany({
        data: { isDefault: false },
      })
    }

    const currency = await prisma.currency.create({
      data: {
        name,
        code,
        symbol,
        isDefault: isDefault ?? false,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ currency })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create currency" }, { status: 500 })
  }
}
