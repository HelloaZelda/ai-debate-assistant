import { type NextRequest, NextResponse } from "next/server"
import { transcribeAudio } from "@/lib/whisper-api"

export async function POST(request: NextRequest) {
  try {
    // Get the audio file from the request
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert the file to a blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Transcribe the audio
    const transcription = await transcribeAudio(audioBlob)

    return NextResponse.json({ text: transcription })
  } catch (error) {
    console.error("Error transcribing audio:", error)
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}

// Increase the body size limit for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
}
