"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type TranscriptionDisplayProps = {
  text: string
  isTranscribing: boolean
  speaker: string
}

export function TranscriptionDisplay({ text, isTranscribing, speaker }: TranscriptionDisplayProps) {
  const [displayText, setDisplayText] = useState(text)

  // Update display text when text prop changes
  useEffect(() => {
    setDisplayText(text)
  }, [text])

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <span>{speaker} 发言记录</span>
          {isTranscribing && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm min-h-[60px] max-h-[120px] overflow-y-auto">
          {displayText ? displayText : isTranscribing ? "正在转写..." : "无转写内容"}
        </div>
      </CardContent>
    </Card>
  )
}
