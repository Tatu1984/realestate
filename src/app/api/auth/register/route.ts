import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { registerSchema, formatZodError } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for auth endpoints
    const rateLimitResponse = checkRateLimit(request, 'auth')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()

    // Validate input with Zod
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatZodError(validationResult.error) },
        { status: 400 }
      )
    }

    const { name, email, password, phone, userType } = validationResult.data

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        userType: userType || "INDIVIDUAL",
      }
    })

    // If user is an agent, create agent profile
    if (userType === "AGENT") {
      await prisma.agentProfile.create({
        data: {
          userId: user.id,
        }
      })
    }

    // If user is a builder, create builder profile
    if (userType === "BUILDER") {
      await prisma.builderProfile.create({
        data: {
          userId: user.id,
          companyName: body.companyName || name,
        }
      })
    }

    // Send welcome email
    await sendWelcomeEmail(email, name)

    logger.authEvent("User registered", user.id, { email, userType })

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Registration error", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
