import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loans = await prisma.loan.findMany({
      orderBy: { interestRate: "asc" },
    })
    return NextResponse.json({ loans })
  } catch (error) {
    console.error("Error fetching loans:", error)
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
    const loan = await prisma.loan.create({
      data: {
        bankName: body.bankName,
        interestRate: body.interestRate,
        minAmount: body.minAmount,
        maxAmount: body.maxAmount,
        tenure: body.tenure,
        processingFee: body.processingFee,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json({ loan })
  } catch (error) {
    console.error("Error creating loan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
