"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { RecordingPermission } from "@/components/recording-permission"
import { transcribeLive } from "@/services/transcribe-service"

type AudioRecorderProps = {
  onRecordingComplete?: (blob: Blob) => void
  onTranscriptionUpdate?: (text: string) => void
  disabled?: boolean
  enableTranscription?: boolean
}

export function AudioRecorder({
  onRecordingComplete,
  onTranscriptionUpdate,
  disabled = false,
  enableTranscription = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionText, setTranscriptionText] = useState("")

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

          // If transcription is enabled, send the audio chunk for live transcription
          if (enableTranscription && onTranscriptionUpdate) {
            const audioBlob = new Blob([event.data], { type: "audio/wav" })
            handleLiveTranscription(audioBlob)
          }
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

      // Set a smaller timeslice for more frequent ondataavailable events (for live transcription)
      mediaRecorder.start(enableTranscription ? 1000 : undefined)
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
      setIsTranscribing(false)
    }
  }

  const handleLiveTranscription = async (audioBlob: Blob) => {
    if (!isTranscribing) {
      setIsTranscribing(true)
    }

    try {
      await transcribeLive(
        audioBlob,
        (text) => {
          setTranscriptionText((prev) => {
            const newText = prev ? `${prev} ${text}` : text
            if (onTranscriptionUpdate) {
              onTranscriptionUpdate(newText)
            }
            return newText
          })
        },
        () => {
          setIsTranscribing(false)
        },
      )
    } catch (error) {
      console.error("Transcription error:", error)
      setIsTranscribing(false)
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
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <MicOff className="h-4 w-4 mr-1" />
                )}
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
