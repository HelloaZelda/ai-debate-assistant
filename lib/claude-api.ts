// Utility functions for interacting with the Claude API

export interface SummarizeRequest {
  transcript: string
  topic: string
  debateStage: string
}

export interface SummarizeResponse {
  summary: string
  affirmativePoints: string[]
  negativePoints: string[]
  keyIssues: string[]
  highlight?: {
    content: string
    speaker: string
  }
}

export interface SuggestionRequest {
  transcript: string
  topic: string
  currentSpeaker: string // "affirmative" or "negative"
  debateStage: string
}

export interface SuggestionResponse {
  suggestion: string
  type: string // "argument", "rebuttal", "evidence", "logic"
}

/**
 * Sends a request to the Claude API to summarize debate content
 */
export async function summarizeDebate(request: SummarizeRequest): Promise<SummarizeResponse> {
  const { transcript, topic, debateStage } = request

  try {
    const response = await fetch(`${process.env.CLAUDE_API_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLAUDE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        messages: [
          {
            role: "system",
            content:
              "You are an expert debate analyst. Your task is to analyze debate transcripts and provide insightful summaries and key points from both sides.",
          },
          {
            role: "user",
            content: `Please analyze the following debate transcript on the topic: "${topic}". The debate is currently in the "${debateStage}" stage.

Transcript:
${transcript}

Please provide:
1. A brief summary of the debate so far
2. Key points made by the affirmative side (3-5 points)
3. Key points made by the negative side (3-5 points)
4. Main issues of contention (2-3 points)
5. A notable highlight or quote from the debate

Format your response as JSON with the following structure:
{
  "summary": "Brief summary text",
  "affirmativePoints": ["Point 1", "Point 2", ...],
  "negativePoints": ["Point 1", "Point 2", ...],
  "keyIssues": ["Issue 1", "Issue 2", ...],
  "highlight": {
    "content": "The quote",
    "speaker": "affirmative or negative"
  }
}`,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Claude API error:", errorData)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON response
    return JSON.parse(content)
  } catch (error) {
    console.error("Error summarizing debate:", error)
    // Return a fallback response
    return {
      summary: "Unable to generate summary at this time.",
      affirmativePoints: ["Point extraction failed"],
      negativePoints: ["Point extraction failed"],
      keyIssues: ["Issue extraction failed"],
    }
  }
}

/**
 * Sends a request to the Claude API to get debate suggestions
 */
export async function getDebateSuggestion(request: SuggestionRequest): Promise<SuggestionResponse> {
  const { transcript, topic, currentSpeaker, debateStage } = request

  try {
    const response = await fetch(`${process.env.CLAUDE_API_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLAUDE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        messages: [
          {
            role: "system",
            content:
              "You are an expert debate coach. Your task is to provide strategic suggestions to debaters based on the current state of the debate.",
          },
          {
            role: "user",
            content: `Please provide a strategic suggestion for the ${currentSpeaker} side in this debate on the topic: "${topic}". The debate is currently in the "${debateStage}" stage.

Recent transcript:
${transcript}

Please provide a single, concise suggestion that would help the ${currentSpeaker} side strengthen their position or counter the opposing side's arguments.

Format your response as JSON with the following structure:
{
  "suggestion": "Your strategic suggestion here",
  "type": "argument/rebuttal/evidence/logic"
}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Claude API error:", errorData)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON response
    return JSON.parse(content)
  } catch (error) {
    console.error("Error getting debate suggestion:", error)
    // Return a fallback response
    return {
      suggestion: "Unable to generate suggestion at this time.",
      type: "general",
    }
  }
}
