import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const plans = await prisma.membershipPlan.findMany({
      orderBy: { price: "asc" },
    })
    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Error fetching plans:", error)
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
    const plan = await prisma.membershipPlan.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        duration: body.duration,
        featuredListings: body.featuredListings || 0,
        premiumListings: body.premiumListings || 0,
        basicListings: body.basicListings || 0,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
