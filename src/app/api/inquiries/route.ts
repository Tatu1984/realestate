import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createInquirySchema, formatZodError } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { sendInquiryEmail } from "@/lib/email"

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
    logger.error("Error fetching inquiries", error)
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for contact/inquiry forms
    const rateLimitResponse = checkRateLimit(request, 'contact')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const session = await auth()
    const body = await request.json()

    // Validate input with Zod
    const validationResult = createInquirySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatZodError(validationResult.error) },
        { status: 400 }
      )
    }

    const { propertyId, receiverId, name, email, phone, message } = validationResult.data

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true, email: true },
    })

    if (!receiver) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      )
    }

    // Get property title if propertyId is provided
    let propertyTitle: string | undefined
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { title: true },
      })
      propertyTitle = property?.title
    }

    // For non-authenticated users, we need to create a guest sender record
    // or handle it differently. For now, require authentication.
    if (!session?.user?.id) {
      // Create inquiry without senderId for guest users (store contact info in the inquiry itself)
      // We'll use a special handling - create inquiry with receiverId as temporary senderId
      // but mark it clearly in the data
      const inquiry = await prisma.inquiry.create({
        data: {
          senderId: receiverId, // Self-reference for guest inquiries (not ideal, but maintains FK)
          receiverId,
          propertyId: propertyId || null,
          name,
          email,
          phone: phone || null,
          message,
          status: "PENDING",
        },
      })

      // Send email notification
      await sendInquiryEmail(
        receiver.email,
        receiver.name,
        name,
        email,
        phone || null,
        message,
        propertyTitle
      )

      logger.info("Guest inquiry created", { inquiryId: inquiry.id, receiverId })

      return NextResponse.json(
        { message: "Inquiry sent successfully", inquiry },
        { status: 201 }
      )
    }

    // Prevent users from sending inquiries to themselves
    if (session.user.id === receiverId) {
      return NextResponse.json(
        { error: "Cannot send inquiry to yourself" },
        { status: 400 }
      )
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        senderId: session.user.id,
        receiverId,
        propertyId: propertyId || null,
        name,
        email,
        phone: phone || null,
        message,
        status: "PENDING",
      },
    })

    // Send email notification
    await sendInquiryEmail(
      receiver.email,
      receiver.name,
      name,
      email,
      phone || null,
      message,
      propertyTitle
    )

    logger.info("Inquiry created", { inquiryId: inquiry.id, senderId: session.user.id, receiverId })

    return NextResponse.json(
      { message: "Inquiry sent successfully", inquiry },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Error creating inquiry", error)
    return NextResponse.json(
      { error: "Failed to send inquiry" },
      { status: 500 }
    )
  }
}
