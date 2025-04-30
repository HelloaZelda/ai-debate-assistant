import { type NextRequest, NextResponse } from "next/server"
import { updateDebatePhase, getDebate } from "@/lib/debate-state"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { debateId, phaseId } = body

    if (!debateId || !phaseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = updateDebatePhase(debateId, phaseId)

    if (!success) {
      return NextResponse.json({ error: "Failed to update debate phase" }, { status: 404 })
    }

    const updatedDebate = getDebate(debateId)

    return NextResponse.json({
      success: true,
      currentPhase: updatedDebate?.currentPhase,
    })
  } catch (error) {
    console.error("Error updating debate phase:", error)
    return NextResponse.json({ error: "Failed to update debate phase" }, { status: 500 })
  }
}
