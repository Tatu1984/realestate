import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscribers = await prisma.newsletterSubscription.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      subscribers,
      count: subscribers.length,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject, content, recipients } = body

    // In a real app, you would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll just simulate sending

    const subscriberCount = recipients === "all"
      ? await prisma.newsletterSubscription.count({ where: { isActive: true } })
      : recipients.length

    // Log the newsletter send attempt
    console.log(`Newsletter sent to ${subscriberCount} subscribers`)
    console.log(`Subject: ${subject}`)
    console.log(`Content: ${content.substring(0, 100)}...`)

    return NextResponse.json({
      success: true,
      message: `Newsletter queued for ${subscriberCount} subscribers`,
      sentTo: subscriberCount,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
  }
}
