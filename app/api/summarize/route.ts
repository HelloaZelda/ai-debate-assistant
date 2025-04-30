import { type NextRequest, NextResponse } from "next/server"
import { summarizeDebate } from "@/lib/claude-api"
import { getDebate, getTranscripts } from "@/lib/debate-state"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { debateId } = body

    if (!debateId) {
      return NextResponse.json({ error: "Missing debate ID" }, { status: 400 })
    }

    const debate = getDebate(debateId)

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 })
    }

    const transcripts = getTranscripts(debateId)

    if (transcripts.length === 0) {
      return NextResponse.json({ error: "No transcripts available for summarization" }, { status: 400 })
    }

    // Combine all transcripts into a single text
    const transcriptText = transcripts
      .map((t) => `${t.speaker === "affirmative" ? debate.affirmative : debate.negative}: ${t.content}`)
      .join("\n\n")

    const summary = await summarizeDebate({
      transcript: transcriptText,
      topic: debate.topic,
      debateStage: debate.currentPhase?.name || "Unknown",
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error summarizing debate:", error)
    return NextResponse.json({ error: "Failed to summarize debate" }, { status: 500 })
  }
}
