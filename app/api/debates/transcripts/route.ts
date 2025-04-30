import { type NextRequest, NextResponse } from "next/server"
import { addTranscript, getTranscripts } from "@/lib/debate-state"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { debateId, content, speaker } = body

    if (!debateId || !content || !speaker) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transcript = addTranscript(debateId, content, speaker)

    if (!transcript) {
      return NextResponse.json({ error: "Failed to add transcript" }, { status: 404 })
    }

    return NextResponse.json(transcript)
  } catch (error) {
    console.error("Error adding transcript:", error)
    return NextResponse.json({ error: "Failed to add transcript" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const debateId = searchParams.get("debateId")

    if (!debateId) {
      return NextResponse.json({ error: "Missing debate ID" }, { status: 400 })
    }

    const transcripts = getTranscripts(debateId)

    return NextResponse.json(transcripts)
  } catch (error) {
    console.error("Error fetching transcripts:", error)
    return NextResponse.json({ error: "Failed to fetch transcripts" }, { status: 500 })
  }
}
