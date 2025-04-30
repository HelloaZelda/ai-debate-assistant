import prisma from "./prisma"

export interface ExportOptions {
  format: "txt" | "json" | "csv"
  includeStatistics: boolean
  includeSuggestions: boolean
}

export async function exportDebateData(debateId: string, options: ExportOptions): Promise<string> {
  const debate = await prisma.debate.findUnique({
    where: { id: debateId },
    include: {
      phases: {
        orderBy: { order: "asc" },
      },
      transcripts: {
        orderBy: { timestamp: "asc" },
      },
      statistics: options.includeStatistics,
      aiSuggestions: options.includeSuggestions
        ? {
            orderBy: { timestamp: "desc" },
          }
        : false,
    },
  })

  if (!debate) {
    throw new Error("Debate not found")
  }

  switch (options.format) {
    case "txt":
      return exportAsTxt(debate, options)
    case "json":
      return JSON.stringify(debate, null, 2)
    case "csv":
      return exportAsCsv(debate, options)
    default:
      throw new Error("Unsupported export format")
  }
}

function exportAsTxt(debate, options: ExportOptions): string {
  let output = ""

  // Header
  output += `辩题: ${debate.topic}\n`
  output += `日期: ${new Date(debate.createdAt).toLocaleDateString()}\n`
  output += `模式: ${debate.mode === "standard" ? "标准模式" : "自由模式"}\n`
  output += `正方: ${debate.affirmative}\n`
  output += `反方: ${debate.negative}\n\n`

  // Phases
  output += "辩论阶段:\n"
  for (const phase of debate.phases) {
    const duration = Math.floor(phase.duration / 60)
    output += `- ${phase.name} (${duration}分钟)\n`
  }
  output += "\n"

  // Transcripts
  output += "辩论记录:\n\n"
  for (const transcript of debate.transcripts) {
    const speaker = transcript.speaker === "affirmative" ? debate.affirmative : debate.negative
    const time = new Date(transcript.timestamp).toLocaleTimeString()
    output += `[${time}] ${speaker}: ${transcript.content}\n\n`
  }

  // Statistics
  if (options.includeStatistics && debate.statistics) {
    output += "统计数据:\n"
    output += `总时长: ${formatTime(debate.statistics.totalDuration)}\n`
    output += `正方发言时长: ${formatTime(debate.statistics.affirmativeDuration)}\n`
    output += `反方发言时长: ${formatTime(debate.statistics.negativeDuration)}\n`
    output += `正方发言次数: ${debate.statistics.affirmativeCount}\n`
    output += `反方发言次数: ${debate.statistics.negativeCount}\n`
    if (debate.statistics.interruptionCount) {
      output += `打断次数: ${debate.statistics.interruptionCount}\n`
    }
    output += "\n"
  }

  // AI Suggestions
  if (options.includeSuggestions && debate.aiSuggestions && debate.aiSuggestions.length > 0) {
    output += "AI建议:\n\n"
    for (const suggestion of debate.aiSuggestions) {
      const time = new Date(suggestion.timestamp).toLocaleTimeString()
      const type = mapSuggestionType(suggestion.type)
      const target =
        suggestion.target === "affirmative"
          ? debate.affirmative
          : suggestion.target === "negative"
            ? debate.negative
            : "通用"

      output += `[${time}] ${type} (针对: ${target}):\n`
      output += `${suggestion.content}\n\n`
    }
  }

  return output
}

function exportAsCsv(debate, options: ExportOptions): string {
  let output = ""

  // Header row
  output += "timestamp,speaker,content\n"

  // Transcripts
  for (const transcript of debate.transcripts) {
    const time = new Date(transcript.timestamp).toISOString()
    const speaker = transcript.speaker === "affirmative" ? debate.affirmative : debate.negative
    // Escape quotes and commas in content
    const content = transcript.content.replace(/"/g, '""')

    output += `"${time}","${speaker}","${content}"\n`
  }

  return output
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function mapSuggestionType(type: string): string {
  const typeMap = {
    argument: "论点建议",
    logic: "逻辑分析",
    data: "数据支持",
    rebuttal: "反驳建议",
    general: "一般建议",
  }

  return typeMap[type] || type
}
