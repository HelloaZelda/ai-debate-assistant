import { type NextRequest, NextResponse } from "next/server"
import { generateDebateSummary } from "@/lib/debate-summary"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const summary = await generateDebateSummary({
      debateId: params.id,
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
