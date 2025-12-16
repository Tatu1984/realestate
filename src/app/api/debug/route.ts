import { NextResponse } from "next/server"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL

  return NextResponse.json({
    env: {
      DATABASE_URL_EXISTS: !!dbUrl,
      DATABASE_URL_LENGTH: dbUrl?.length || 0,
      DATABASE_URL_STARTS_WITH: dbUrl?.substring(0, 20) || "NOT SET",
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    }
  })
}
