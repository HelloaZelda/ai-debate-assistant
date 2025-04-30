import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transcripts = await prisma.transcript.findMany({
      where: { debateId: params.id },
      orderBy: { timestamp: "asc" },
    })

    return NextResponse.json(transcripts)
  } catch (error) {
    console.error("Error fetching transcripts:", error)
    return NextResponse.json({ error: "Failed to fetch transcripts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { content, speaker, phaseId, duration } = body

    const transcript = await prisma.transcript.create({
      data: {
        debateId: params.id,
        content,
        speaker,
        phaseId,
        duration,
      },
    })

    // Update statistics
    await updateStatistics(params.id, speaker, duration || 0)

    return NextResponse.json(transcript)
  } catch (error) {
    console.error("Error creating transcript:", error)
    return NextResponse.json({ error: "Failed to create transcript" }, { status: 500 })
  }
}

async function updateStatistics(debateId: string, speaker: string, duration: number) {
  const statistics = await prisma.statistics.findUnique({
    where: { debateId },
  })

  if (!statistics) return

  await prisma.statistics.update({
    where: { id: statistics.id },
    data: {
      totalDuration: statistics.totalDuration + duration,
      affirmativeDuration:
        speaker === "affirmative" ? statistics.affirmativeDuration + duration : statistics.affirmativeDuration,
      negativeDuration: speaker === "negative" ? statistics.negativeDuration + duration : statistics.negativeDuration,
      affirmativeCount: speaker === "affirmative" ? statistics.affirmativeCount + 1 : statistics.affirmativeCount,
      negativeCount: speaker === "negative" ? statistics.negativeCount + 1 : statistics.negativeCount,
    },
  })
}
