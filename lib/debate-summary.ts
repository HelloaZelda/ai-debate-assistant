import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import prisma from "./prisma"

export interface DebateSummaryRequest {
  debateId: string
}

export interface DebateSummary {
  affirmativePoints: string[]
  negativePoints: string[]
  keyIssues: string[]
  highlight: {
    content: string
    speaker: string
    phase: string
  }
}

export async function generateDebateSummary(request: DebateSummaryRequest): Promise<DebateSummary> {
  const { debateId } = request

  try {
    // Fetch debate data from the database
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        transcripts: {
          orderBy: { timestamp: "asc" },
        },
        phases: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!debate) {
      throw new Error("Debate not found")
    }

    // Create a prompt for the AI
    const transcriptsText = debate.transcripts
      .map((t) => `${t.speaker === "affirmative" ? "正方" : "反方"}: ${t.content}`)
      .join("\n")

    const prompt = `
你是一个辩论分析AI。请根据以下辩论记录，生成一个全面的辩论摘要：

辩题: ${debate.topic}
正方: ${debate.affirmative}
反方: ${debate.negative}

辩论记录:
${transcriptsText}

请提供以下格式的摘要:
1. 正方主要论点（列出3-5点）
2. 反方主要论点（列出3-5点）
3. 关键争议点（列出3点）
4. 一个精彩瞬间（引用最有力或最精彩的论点，并注明是哪一方的发言）

请确保摘要准确反映双方的立场和论点。
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Parse the AI response into our expected format
    // This is a simplified parsing logic - in a real app, you'd want more robust parsing
    const sections = text.split(/\d+\.\s+/).filter(Boolean)

    return {
      affirmativePoints: parsePoints(sections[0] || ""),
      negativePoints: parsePoints(sections[1] || ""),
      keyIssues: parsePoints(sections[2] || ""),
      highlight: parseHighlight(sections[3] || ""),
    }
  } catch (error) {
    console.error("Error generating debate summary:", error)
    return {
      affirmativePoints: ["无法生成正方论点摘要"],
      negativePoints: ["无法生成反方论点摘要"],
      keyIssues: ["无法生成关键争议点"],
      highlight: {
        content: "无法提取精彩瞬间",
        speaker: "",
        phase: "",
      },
    }
  }
}

function parsePoints(text: string): string[] {
  // Extract bullet points or numbered items
  const points = text.split(/[•\-*]|\d+\./).filter((line) => line.trim().length > 0)
  return points.length > 0 ? points.map((p) => p.trim()) : [text.trim()]
}

function parseHighlight(text: string): { content: string; speaker: string; phase: string } {
  // Try to extract a quote and its attribution
  const quoteMatch = text.match(/"([^"]+)"/)
  const speakerMatch = text.match(/(正方|反方)/)

  return {
    content: quoteMatch ? quoteMatch[1] : text.trim(),
    speaker: speakerMatch ? speakerMatch[1] : "",
    phase: "", // This is harder to extract reliably
  }
}
