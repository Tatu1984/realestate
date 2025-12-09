import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) {
      updateData.name = body.name
      updateData.slug = body.name.toLowerCase().replace(/\s+/g, "-")
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.image !== undefined) updateData.image = body.image
    if (body.parentId !== undefined) updateData.parentId = body.parentId
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.order !== undefined) updateData.order = body.order

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
