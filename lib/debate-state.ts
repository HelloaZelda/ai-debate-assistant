// In-memory debate state management

export interface DebatePhase {
  id: string
  name: string
  duration: number // in seconds
  speaker: "affirmative" | "negative" | "both"
  order: number
}

export interface Transcript {
  id: string
  content: string
  speaker: "affirmative" | "negative"
  timestamp: Date
}

export interface Debate {
  id: string
  topic: string
  mode: "standard" | "free"
  affirmative: string
  negative: string
  currentPhase: DebatePhase | null
  phases: DebatePhase[]
  transcripts: Transcript[]
  startedAt: Date | null
  endedAt: Date | null
}

// In-memory store for active debates
const activeDebates: Map<string, Debate> = new Map()

/**
 * Creates a new debate
 */
export function createDebate(
  topic: string,
  mode: "standard" | "free",
  affirmative: string,
  negative: string,
  timeSettings: {
    prepTime?: number
    openingTime?: number
    debateTime?: number
    freeTime?: number
    conclusionTime?: number
    totalTime?: number
    speechLimit?: number
  },
): Debate {
  const id = generateId()

  // Create phases based on mode
  let phases: DebatePhase[] = []

  if (mode === "standard") {
    const { prepTime = 120, openingTime = 180, debateTime = 900, freeTime = 300, conclusionTime = 120 } = timeSettings

    phases = [
      { id: generateId(), name: "准备阶段", duration: prepTime, order: 0, speaker: "both" },
      { id: generateId(), name: "开篇立论 (正方)", duration: openingTime, order: 1, speaker: "affirmative" },
      { id: generateId(), name: "开篇立论 (反方)", duration: openingTime, order: 2, speaker: "negative" },
      { id: generateId(), name: "对辩环节", duration: debateTime, order: 3, speaker: "both" },
      { id: generateId(), name: "自由辩论", duration: freeTime, order: 4, speaker: "both" },
      { id: generateId(), name: "结辩陈词 (正方)", duration: conclusionTime, order: 5, speaker: "affirmative" },
      { id: generateId(), name: "结辩陈词 (反方)", duration: conclusionTime, order: 6, speaker: "negative" },
    ]
  } else {
    // Free mode
    const { prepTime = 120, totalTime = 1800, conclusionTime = 120 } = timeSettings

    phases = [
      { id: generateId(), name: "准备阶段", duration: prepTime, order: 0, speaker: "both" },
      { id: generateId(), name: "自由辩论", duration: totalTime, order: 1, speaker: "both" },
      { id: generateId(), name: "结辩陈词 (正方)", duration: conclusionTime, order: 2, speaker: "affirmative" },
      { id: generateId(), name: "结辩陈词 (反方)", duration: conclusionTime, order: 3, speaker: "negative" },
    ]
  }

  const debate: Debate = {
    id,
    topic,
    mode,
    affirmative,
    negative,
    currentPhase: phases[0],
    phases,
    transcripts: [],
    startedAt: null,
    endedAt: null,
  }

  activeDebates.set(id, debate)
  return debate
}

/**
 * Gets a debate by ID
 */
export function getDebate(id: string): Debate | null {
  return activeDebates.get(id) || null
}

/**
 * Updates the current phase of a debate
 */
export function updateDebatePhase(debateId: string, phaseId: string): boolean {
  const debate = activeDebates.get(debateId)
  if (!debate) return false

  const phase = debate.phases.find((p) => p.id === phaseId)
  if (!phase) return false

  debate.currentPhase = phase

  // If this is the first phase and the debate hasn't started yet, mark it as started
  if (phase.order === 0 && !debate.startedAt) {
    debate.startedAt = new Date()
  }

  // If this is the last phase, mark the debate as ended
  if (phase.order === debate.phases.length - 1) {
    debate.endedAt = new Date()
  }

  return true
}

/**
 * Adds a transcript to a debate
 */
export function addTranscript(
  debateId: string,
  content: string,
  speaker: "affirmative" | "negative",
): Transcript | null {
  const debate = activeDebates.get(debateId)
  if (!debate) return null

  const transcript: Transcript = {
    id: generateId(),
    content,
    speaker,
    timestamp: new Date(),
  }

  debate.transcripts.push(transcript)
  return transcript
}

/**
 * Gets all transcripts for a debate
 */
export function getTranscripts(debateId: string): Transcript[] {
  const debate = activeDebates.get(debateId)
  if (!debate) return []

  return [...debate.transcripts]
}

/**
 * Gets recent transcripts for a debate (last n transcripts)
 */
export function getRecentTranscripts(debateId: string, count = 5): Transcript[] {
  const debate = activeDebates.get(debateId)
  if (!debate) return []

  return [...debate.transcripts].slice(-count)
}

/**
 * Ends a debate
 */
export function endDebate(debateId: string): boolean {
  const debate = activeDebates.get(debateId)
  if (!debate) return false

  debate.endedAt = new Date()
  return true
}

/**
 * Generates a simple ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
