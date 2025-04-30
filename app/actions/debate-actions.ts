"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createDebate(formData: FormData) {
  try {
    const topic = formData.get("topic") as string
    const mode = formData.get("mode") as string
    const affirmative = formData.get("affirmative") as string
    const negative = formData.get("negative") as string

    // Parse time settings
    const prepTime = Number.parseInt(formData.get("prep-time") as string) * 60 // convert to seconds
    const openingTime = Number.parseInt(formData.get("opening-time") as string) * 60
    const debateTime = Number.parseInt(formData.get("debate-time") as string) * 60
    const freeTime = Number.parseInt(formData.get("free-time") as string) * 60
    const conclusionTime = Number.parseInt(formData.get("conclusion-time") as string) * 60

    // Create phases based on mode
    let phases
    if (mode === "standard") {
      phases = [
        { name: "准备阶段", duration: prepTime, order: 0, speaker: "both" },
        { name: "开篇立论 (正方)", duration: openingTime, order: 1, speaker: "affirmative" },
        { name: "开篇立论 (反方)", duration: openingTime, order: 2, speaker: "negative" },
        { name: "对辩环节", duration: debateTime, order: 3, speaker: "both" },
        { name: "自由辩论", duration: freeTime, order: 4, speaker: "both" },
        { name: "结辩陈词 (正方)", duration: conclusionTime, order: 5, speaker: "affirmative" },
        { name: "结辩陈词 (反方)", duration: conclusionTime, order: 6, speaker: "negative" },
      ]
    } else {
      // Free mode
      const totalTime = Number.parseInt(formData.get("total-time") as string) * 60
      const speechLimit = Number.parseInt(formData.get("speech-limit") as string) * 60

      phases = [
        { name: "准备阶段", duration: prepTime || 120, order: 0, speaker: "both" },
        { name: "自由辩论", duration: totalTime || 1800, order: 1, speaker: "both" },
        { name: "结辩陈词 (正方)", duration: conclusionTime || 120, order: 2, speaker: "affirmative" },
        { name: "结辩陈词 (反方)", duration: conclusionTime || 120, order: 3, speaker: "negative" },
      ]
    }

    // Create the debate
    const debate = await prisma.debate.create({
      data: {
        topic,
        mode,
        affirmative,
        negative,
        phases: {
          create: phases,
        },
        statistics: {
          create: {
            totalDuration: 0,
            affirmativeDuration: 0,
            negativeDuration: 0,
            affirmativeCount: 0,
            negativeCount: 0,
          },
        },
      },
    })

    revalidatePath("/")
    return { success: true, debateId: debate.id }
  } catch (error) {
    console.error("Error creating debate:", error)
    return { success: false, error: "Failed to create debate" }
  }
}

export async function updateDebatePhase(debateId: string, phaseId: string) {
  try {
    // Mark current phase as ended
    const currentPhase = await prisma.debatePhase.findFirst({
      where: {
        debateId,
        endedAt: null,
        startedAt: { not: null },
      },
    })

    if (currentPhase) {
      await prisma.debatePhase.update({
        where: { id: currentPhase.id },
        data: { endedAt: new Date() },
      })
    }

    // Start new phase
    await prisma.debatePhase.update({
      where: { id: phaseId },
      data: {},
    })

    // Start new phase
    await prisma.debatePhase.update({
      where: { id: phaseId },
      data: {
        startedAt: new Date(),
      },
    })

    revalidatePath(`/debate`)
    return { success: true }
  } catch (error) {
    console.error("Error updating debate phase:", error)
    return { success: false, error: "Failed to update debate phase" }
  }
}

export async function addTranscript(
  debateId: string,
  content: string,
  speaker: string,
  phaseId: string,
  duration: number,
) {
  try {
    const transcript = await prisma.transcript.create({
      data: {
        debateId,
        content,
        speaker,
        phaseId,
        duration,
      },
    })

    // Update statistics
    await prisma.$transaction(async (tx) => {
      const statistics = await tx.statistics.findUnique({
        where: { debateId },
      })

      if (statistics) {
        await tx.statistics.update({
          where: { id: statistics.id },
          data: {
            totalDuration: statistics.totalDuration + duration,
            affirmativeDuration:
              speaker === "affirmative" ? statistics.affirmativeDuration + duration : statistics.affirmativeDuration,
            negativeDuration:
              speaker === "negative" ? statistics.negativeDuration + duration : statistics.negativeDuration,
            affirmativeCount: speaker === "affirmative" ? statistics.affirmativeCount + 1 : statistics.affirmativeCount,
            negativeCount: speaker === "negative" ? statistics.negativeCount + 1 : statistics.negativeCount,
          },
        })
      }
    })

    revalidatePath(`/debate`)
    return { success: true, transcriptId: transcript.id }
  } catch (error) {
    console.error("Error adding transcript:", error)
    return { success: false, error: "Failed to add transcript" }
  }
}

export async function endDebate(debateId: string) {
  try {
    // End any active phases
    const activePhase = await prisma.debatePhase.findFirst({
      where: {
        debateId,
        endedAt: null,
        startedAt: { not: null },
      },
    })

    if (activePhase) {
      await prisma.debatePhase.update({
        where: { id: activePhase.id },
        data: { endedAt: new Date() },
      })
    }

    // Mark debate as ended
    await prisma.debate.update({
      where: { id: debateId },
      data: { endedAt: new Date() },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error ending debate:", error)
    return { success: false, error: "Failed to end debate" }
  }
}
