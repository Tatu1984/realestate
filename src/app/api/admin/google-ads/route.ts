import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settings = await prisma.googleAdsSetting.findFirst()

    if (!settings) {
      settings = await prisma.googleAdsSetting.create({
        data: {
          publisherId: "",
          headerAdCode: "",
          sidebarAdCode: "",
          footerAdCode: "",
          inArticleAdCode: "",
          isEnabled: false,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { publisherId, headerAdCode, sidebarAdCode, footerAdCode, inArticleAdCode, isEnabled } = body

    let settings = await prisma.googleAdsSetting.findFirst()

    if (settings) {
      settings = await prisma.googleAdsSetting.update({
        where: { id: settings.id },
        data: {
          publisherId,
          headerAdCode,
          sidebarAdCode,
          footerAdCode,
          inArticleAdCode,
          isEnabled,
        },
      })
    } else {
      settings = await prisma.googleAdsSetting.create({
        data: {
          publisherId,
          headerAdCode,
          sidebarAdCode,
          footerAdCode,
          inArticleAdCode,
          isEnabled,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
