import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        builder: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get properties in this project
    const properties = await prisma.property.findMany({
      where: {
        projectId: id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        price: true,
        propertyType: true,
        bedrooms: true,
        bathrooms: true,
        builtUpArea: true,
        images: true,
      },
      orderBy: { price: "asc" },
    })

    return NextResponse.json({ project, properties })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}
