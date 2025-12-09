import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requests = await prisma.membershipRequest.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    const membershipRequest = await prisma.membershipRequest.update({
      where: { id },
      data: { status },
    })

    // If approved, update user's membership
    if (status === "APPROVED") {
      const req = await prisma.membershipRequest.findUnique({ where: { id } })
      if (req) {
        const plan = await prisma.membershipPlan.findUnique({ where: { id: req.planId } })
        if (plan) {
          await prisma.membership.upsert({
            where: { userId: req.userId },
            update: {
              planId: req.planId,
              startDate: new Date(),
              endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
              status: "ACTIVE",
            },
            create: {
              userId: req.userId,
              planId: req.planId,
              startDate: new Date(),
              endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
              status: "ACTIVE",
            },
          })
        }
      }
    }

    return NextResponse.json({ request: membershipRequest })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
