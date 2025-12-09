import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const location = searchParams.get("location")
    const listingType = searchParams.get("listingType")
    const propertyType = searchParams.get("propertyType")
    const bedrooms = searchParams.get("bedrooms")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "newest"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    // Build where clause
    const where: Record<string, unknown> = {
      status: "ACTIVE",
    }

    if (listingType) {
      where.listingType = listingType
    }

    if (propertyType && propertyType !== "All Types") {
      where.propertyType = propertyType.toUpperCase()
    }

    if (bedrooms && bedrooms !== "Any") {
      if (bedrooms === "5+") {
        where.bedrooms = { gte: 5 }
      } else {
        where.bedrooms = parseInt(bedrooms)
      }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice)
    }

    if (location) {
      where.OR = [
        { city: { contains: location } },
        { locality: { contains: location } },
        { state: { contains: location } },
      ]
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" }
    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" }
        break
      case "price_desc":
        orderBy = { price: "desc" }
        break
      case "popular":
        orderBy = { views: "desc" }
        break
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              phone: true,
              userType: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ])

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const property = await prisma.property.create({
      data: {
        userId: session.user.id,
        title: body.title,
        description: body.description,
        propertyType: body.propertyType,
        listingType: body.listingType,
        address: body.address,
        locality: body.locality,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        balconies: body.balconies,
        floorNumber: body.floorNumber,
        totalFloors: body.totalFloors,
        facing: body.facing,
        furnishing: body.furnishing,
        builtUpArea: body.builtUpArea,
        carpetArea: body.carpetArea,
        plotArea: body.plotArea,
        price: body.price,
        pricePerSqft: body.pricePerSqft,
        maintenance: body.maintenance,
        securityDeposit: body.securityDeposit,
        images: body.images ? JSON.stringify(body.images) : null,
        videoUrl: body.videoUrl,
        amenities: body.amenities ? JSON.stringify(body.amenities) : null,
        availableFrom: body.availableFrom ? new Date(body.availableFrom) : null,
        status: "PENDING", // Admin needs to approve
      },
    })

    return NextResponse.json(
      { message: "Property created successfully", property },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    )
  }
}
