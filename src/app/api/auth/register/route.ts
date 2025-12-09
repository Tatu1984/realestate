import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, userType } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

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
        phone,
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

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
