import { type NextRequest, NextResponse } from "next/server"
import { exportDebateData } from "@/lib/export-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "txt"
    const includeStatistics = searchParams.get("stats") === "true"
    const includeSuggestions = searchParams.get("suggestions") === "true"

    const data = await exportDebateData(params.id, {
      format: format as "txt" | "json" | "csv",
      includeStatistics,
      includeSuggestions,
    })

    // Set appropriate content type
    let contentType = "text/plain"
    if (format === "json") contentType = "application/json"
    if (format === "csv") contentType = "text/csv"

    // Generate filename
    const filename = `debate_${params.id}.${format}`

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting debate:", error)
    return NextResponse.json({ error: "Failed to export debate" }, { status: 500 })
  }
}
