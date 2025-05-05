"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"
import { RecordingPermission } from "@/components/recording-permission"

type AudioRecorderProps = {
  onRecordingComplete?: (blob: Blob) => void
  disabled?: boolean
}

export function AudioRecorder({ onRecordingComplete, disabled = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    if (!permissionGranted) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob)
        }

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null

        // Reset recording time
        setRecordingTime(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      setPermissionGranted(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center space-x-2">
      {!permissionGranted ? (
        <RecordingPermission onPermissionChange={setPermissionGranted} />
      ) : (
        <>
          {isRecording ? (
            <>
              <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={stopRecording}
                className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
              >
                <MicOff className="h-4 w-4 mr-1" />
                停止录音
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startRecording} disabled={disabled}>
              <Mic className="h-4 w-4 mr-1" />
              开始录音
            </Button>
          )}
        </>
      )}
    </div>
  )
}
