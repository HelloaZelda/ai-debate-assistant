export async function transcribeLive(file: Blob, onData: (t: string) => void, onDone: () => void) {
  const form = new FormData()
  form.append("file", file)
  form.append("model", "small")
  form.append("stream", "true")

  try {
    const response = await fetch("https://api.yourdomain.cn/v1/audio/transcriptions", {
      method: "POST",
      body: form,
    })

    if (!response.ok) {
      throw new Error(`Transcription API error: ${response.status}`)
    }

    const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader()

    let buf = ""
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buf += value
      const parts = buf.split("\n\n")
      buf = parts.pop()!
      for (const part of parts) {
        const data = part.replace(/^data:\s*/, "")
        if (data === "[DONE]") {
          onDone()
        } else {
          try {
            onData(JSON.parse(data).text)
          } catch (e) {
            console.error("Error parsing transcription data:", e)
          }
        }
      }
    }
  } catch (error) {
    console.error("Transcription error:", error)
    onDone()
  }
}
