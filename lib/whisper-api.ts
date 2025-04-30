// Utility functions for interacting with the Whisper API

/**
 * Transcribes audio using OpenAI's Whisper model
 * @param audioBlob The audio blob to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", audioBlob, "audio.webm")
    formData.append("model", "whisper-1")
    formData.append("language", "zh") // Chinese language

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Whisper API error:", errorData)
      throw new Error(`Whisper API error: ${response.status}`)
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error("Error transcribing audio:", error)
    throw error
  }
}
