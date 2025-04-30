import { type NextRequest, NextResponse } from "next/server"
import { getDebateSuggestion } from "@/lib/claude-api"
import { getDebate, getRecentTranscripts } from "@/lib/debate-state"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { debateId, currentSpeaker } = body

    if (!debateId || !currentSpeaker) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const debate = getDebate(debateId)

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 })
    }

    const recentTranscripts = getRecentTranscripts(debateId, 3)

    // Combine recent transcripts into a single text
    const transcriptText = recentTranscripts
      .map((t) => `${t.speaker === "affirmative" ? debate.affirmative : debate.negative}: ${t.content}`)
      .join("\n\n")

    const suggestion = await getDebateSuggestion({
      transcript: transcriptText,
      topic: debate.topic,
      currentSpeaker,
      debateStage: debate.currentPhase?.name || "Unknown",
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error("Error getting debate suggestion:", error)
    return NextResponse.json({ error: "Failed to get debate suggestion" }, { status: 500 })
  }
}
