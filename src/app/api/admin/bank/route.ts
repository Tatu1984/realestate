import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bankDetails = await prisma.bankDetail.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ bankDetails })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch bank details" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { accountName, accountNumber, bankName, branchName, ifscCode, swiftCode, isActive } = body

    const bankDetail = await prisma.bankDetail.create({
      data: {
        accountName,
        accountNumber,
        bankName,
        branchName,
        ifscCode,
        swiftCode,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ bankDetail })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create bank detail" }, { status: 500 })
  }
}
