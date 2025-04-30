import { type NextRequest, NextResponse } from "next/server"
import { createDebate, getDebate } from "@/lib/debate-state"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, mode, affirmative, negative, timeSettings } = body

    if (!topic || !mode || !affirmative || !negative) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const debate = createDebate(topic, mode, affirmative, negative, timeSettings || {})

    return NextResponse.json(debate)
  } catch (error) {
    console.error("Error creating debate:", error)
    return NextResponse.json({ error: "Failed to create debate" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing debate ID" }, { status: 400 })
    }

    const debate = getDebate(id)

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 })
    }

    return NextResponse.json(debate)
  } catch (error) {
    console.error("Error fetching debate:", error)
    return NextResponse.json({ error: "Failed to fetch debate" }, { status: 500 })
  }
}
