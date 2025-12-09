import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, type, amount, currency, status, paymentMethod, transactionId, description } = body

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount,
        currency: currency ?? "INR",
        status: status ?? "PENDING",
        paymentMethod,
        transactionId,
        description,
      },
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
