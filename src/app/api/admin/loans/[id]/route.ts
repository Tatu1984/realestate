import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { updateLoanSchema, formatZodError } from "@/lib/validations"
import { logger } from "@/lib/logger"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate input with Zod
    const validationResult = updateLoanSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatZodError(validationResult.error) },
        { status: 400 }
      )
    }

    const loan = await prisma.loan.update({
      where: { id },
      data: validationResult.data,
    })

    logger.info("Loan updated", { id, adminId: session.user.id })

    return NextResponse.json({ loan })
  } catch (error) {
    logger.error("Error updating loan", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.loan.delete({ where: { id } })

    logger.info("Loan deleted", { id, adminId: session.user.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error deleting loan", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
