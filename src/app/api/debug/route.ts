import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()

    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
