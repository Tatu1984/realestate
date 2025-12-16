import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://")
const cookieName = useSecureCookies
  ? "__Secure-authjs.session-token"
  : "authjs.session-token"

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL

  let dbStatus = "unknown"
  let dbError = null
  let userCount = 0
  let token = null

  try {
    userCount = await prisma.user.count()
    dbStatus = "connected"
  } catch (error) {
    dbStatus = "error"
    dbError = error instanceof Error ? error.message : String(error)
  }

  try {
    token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, cookieName })
  } catch (error) {
    token = { error: error instanceof Error ? error.message : String(error) }
  }

  return NextResponse.json({
    env: {
      DATABASE_URL_EXISTS: !!dbUrl,
      DATABASE_URL_LENGTH: dbUrl?.length || 0,
      DATABASE_URL_STARTS_WITH: dbUrl?.substring(0, 20) || "NOT SET",
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    },
    database: {
      status: dbStatus,
      error: dbError,
      userCount: userCount,
    },
    session: {
      token: token,
    }
  })
}
