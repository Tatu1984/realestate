import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createContactSchema, formatZodError } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { sendContactFormEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for contact forms
    const rateLimitResponse = checkRateLimit(request, 'contact')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()

    // Validate input with Zod
    const validationResult = createContactSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatZodError(validationResult.error) },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, message } = validationResult.data

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      },
    })

    // Send email notification to admin
    await sendContactFormEmail(name, email, phone || null, subject || null, message)

    logger.info("Contact form submitted", { id: contactMessage.id, email })

    return NextResponse.json(
      { message: "Message sent successfully", id: contactMessage.id },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Contact form error", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
