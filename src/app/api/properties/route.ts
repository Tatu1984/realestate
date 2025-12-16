import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createPropertySchema, formatZodError } from "@/lib/validations"
import { logger } from "@/lib/logger"
import { checkRateLimit } from "@/lib/rate-limit"

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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "12")))

    // Build where clause
    const where: Record<string, unknown> = {
      status: "ACTIVE",
    }

    if (listingType && ['SELL', 'RENT', 'PG', 'ROOMMATE'].includes(listingType)) {
      where.listingType = listingType
    }

    if (propertyType && propertyType !== "All Types") {
      const validTypes = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG', 'ROOMMATE']
      const upperType = propertyType.toUpperCase()
      if (validTypes.includes(upperType)) {
        where.propertyType = upperType
      }
    }

    if (bedrooms && bedrooms !== "Any") {
      if (bedrooms === "5+") {
        where.bedrooms = { gte: 5 }
      } else {
        const bedroomNum = parseInt(bedrooms)
        if (!isNaN(bedroomNum) && bedroomNum >= 0) {
          where.bedrooms = bedroomNum
        }
      }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        const minPriceNum = parseFloat(minPrice)
        if (!isNaN(minPriceNum) && minPriceNum >= 0) {
          (where.price as Record<string, number>).gte = minPriceNum
        }
      }
      if (maxPrice) {
        const maxPriceNum = parseFloat(maxPrice)
        if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
          (where.price as Record<string, number>).lte = maxPriceNum
        }
      }
    }

    if (location && location.length <= 100) {
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
    logger.error("Error fetching properties", error)
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, 'api')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input with Zod
    const validationResult = createPropertySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatZodError(validationResult.error) },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const property = await prisma.property.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description || null,
        propertyType: data.propertyType,
        listingType: data.listingType,
        address: data.address,
        locality: data.locality,
        city: data.city,
        state: data.state,
        pincode: data.pincode || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        balconies: data.balconies || null,
        floorNumber: data.floorNumber || null,
        totalFloors: data.totalFloors || null,
        facing: data.facing || null,
        furnishing: data.furnishing || null,
        builtUpArea: data.builtUpArea || null,
        carpetArea: data.carpetArea || null,
        plotArea: data.plotArea || null,
        price: data.price,
        pricePerSqft: data.pricePerSqft || null,
        maintenance: data.maintenance || null,
        securityDeposit: data.securityDeposit || null,
        images: data.images || null,
        videoUrl: data.videoUrl || null,
        amenities: data.amenities || null,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
        projectId: data.projectId || null,
        status: "PENDING", // Admin needs to approve
      },
    })

    logger.info("Property created", { propertyId: property.id, userId: session.user.id })

    return NextResponse.json(
      { message: "Property created successfully", property },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Error creating property", error)
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    )
  }
}
