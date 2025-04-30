import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: params.id },
      include: {
        phases: {
          orderBy: { order: "asc" },
        },
        transcripts: {
          orderBy: { timestamp: "asc" },
        },
        statistics: true,
        aiSuggestions: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    })

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 })
    }

    return NextResponse.json(debate)
  } catch (error) {
    console.error("Error fetching debate:", error)
    return NextResponse.json({ error: "Failed to fetch debate" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { topic, mode, affirmative, negative, startedAt, endedAt } = body

    const debate = await prisma.debate.update({
      where: { id: params.id },
      data: {
        topic,
        mode,
        affirmative,
        negative,
        startedAt,
        endedAt,
      },
    })

    return NextResponse.json(debate)
  } catch (error) {
    console.error("Error updating debate:", error)
    return NextResponse.json({ error: "Failed to update debate" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.debate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting debate:", error)
    return NextResponse.json({ error: "Failed to delete debate" }, { status: 500 })
  }
}
