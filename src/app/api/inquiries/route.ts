import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inquiries = await prisma.inquiry.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error("Error fetching inquiries:", error)
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()

    const { propertyId, receiverId, name, email, phone, message } = body

    if (!receiverId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        senderId: session?.user?.id || receiverId, // If not logged in, use receiver as sender
        receiverId,
        propertyId,
        name,
        email,
        phone,
        message,
      },
    })

    return NextResponse.json(
      { message: "Inquiry sent successfully", inquiry },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating inquiry:", error)
    return NextResponse.json(
      { error: "Failed to send inquiry" },
      { status: 500 }
    )
  }
}
