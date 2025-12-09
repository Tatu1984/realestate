import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            userType: true,
            avatar: true,
            agentProfile: true,
            builderProfile: true,
          },
        },
        project: {
          include: {
            builder: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Increment views
    await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Check if user owns the property or is admin
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    if (
      existingProperty.userId !== session.user.id &&
      session.user.userType !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
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
      },
    })

    return NextResponse.json({ message: "Property updated", property })
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if user owns the property or is admin
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    if (
      existingProperty.userId !== session.user.id &&
      session.user.userType !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await prisma.property.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Property deleted" })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    )
  }
}
