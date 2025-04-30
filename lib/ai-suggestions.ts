import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export interface AISuggestionRequest {
  debateId: string
  topic: string
  currentPhase: string
  currentSpeaker: string
  recentTranscripts: {
    speaker: string
    content: string
  }[]
  suggestionType?: "argument" | "logic" | "data" | "rebuttal"
}

export interface AISuggestion {
  type: string
  content: string
  target?: string
}

export async function generateAISuggestion(request: AISuggestionRequest): Promise<AISuggestion> {
  const { debateId, topic, currentPhase, currentSpeaker, recentTranscripts, suggestionType } = request

  // Create a prompt for the AI
  const transcriptsText = recentTranscripts
    .map((t) => `${t.speaker === "affirmative" ? "正方" : "反方"}: ${t.content}`)
    .join("\n")

  const prompt = `
你是一个辩论助手AI。请根据以下辩论信息，提供一个有用的${suggestionType ? mapSuggestionType(suggestionType) : ""}建议：

辩题: ${topic}
当前阶段: ${mapPhaseToChineseName(currentPhase)}
当前发言方: ${currentSpeaker === "affirmative" ? "正方" : currentSpeaker === "negative" ? "反方" : "双方"}

最近的发言:
${transcriptsText}

请提供一个简短、有针对性的建议，帮助${currentSpeaker === "affirmative" ? "正方" : currentSpeaker === "negative" ? "反方" : "当前发言方"}在辩论中取得优势。建议应该是具体的、有实质内容的，而不是泛泛而谈。
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    return {
      type: suggestionType || "general",
      content: text,
      target: currentSpeaker,
    }
  } catch (error) {
    console.error("Error generating AI suggestion:", error)
    return {
      type: "general",
      content: "无法生成建议，请稍后再试。",
      target: currentSpeaker,
    }
  }
}

function mapSuggestionType(type: string): string {
  const typeMap = {
    argument: "论点",
    logic: "逻辑",
    data: "数据支持",
    rebuttal: "反驳",
    general: "一般",
  }

  return typeMap[type] || "一般"
}

function mapPhaseToChineseName(phase: string): string {
  const phaseMap = {
    prep: "准备阶段",
    opening_aff: "开篇立论 (正方)",
    opening_neg: "开篇立论 (反方)",
    debate: "对辩环节",
    free: "自由辩论",
    conclusion_aff: "结辩陈词 (正方)",
    conclusion_neg: "结辩陈词 (反方)",
  }

  return phaseMap[phase] || phase
}
