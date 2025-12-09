import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    })

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, dueDate, priority } = body

    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority ?? "MEDIUM",
      },
    })

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
  }
}
