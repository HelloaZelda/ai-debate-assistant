import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateAISuggestion } from "@/lib/ai-suggestions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const suggestions = await prisma.aISuggestion.findMany({
      where: { debateId: params.id },
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { currentPhase, currentSpeaker, suggestionType } = body

    // Fetch debate and recent transcripts
    const debate = await prisma.debate.findUnique({
      where: { id: params.id },
    })

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 })
    }

    const recentTranscripts = await prisma.transcript.findMany({
      where: { debateId: params.id },
      orderBy: { timestamp: "desc" },
      take: 5,
    })

    // Generate AI suggestion
    const aiSuggestion = await generateAISuggestion({
      debateId: params.id,
      topic: debate.topic,
      currentPhase,
      currentSpeaker,
      recentTranscripts: recentTranscripts.map((t) => ({
        speaker: t.speaker,
        content: t.content,
      })),
      suggestionType,
    })

    // Save suggestion to database
    const savedSuggestion = await prisma.aISuggestion.create({
      data: {
        debateId: params.id,
        type: aiSuggestion.type,
        content: aiSuggestion.content,
        target: aiSuggestion.target,
      },
    })

    return NextResponse.json(savedSuggestion)
  } catch (error) {
    console.error("Error creating suggestion:", error)
    return NextResponse.json({ error: "Failed to create suggestion" }, { status: 500 })
  }
}
