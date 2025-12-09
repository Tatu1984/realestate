import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            propertyType: true,
            listingType: true,
            locality: true,
            city: true,
            bedrooms: true,
            bathrooms: true,
            builtUpArea: true,
            images: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Already in favorites" }, { status: 400 })
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        propertyId,
      },
      include: {
        property: true,
      },
    })

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
  }
}
