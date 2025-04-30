"use client"

import { useState, useRef, useCallback } from "react"

interface UseAudioRecorderProps {
  onTranscriptionComplete?: (text: string) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  onError?: (error: string) => void
}

interface UseAudioRecorderReturn {
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  error: string | null
  isProcessing: boolean
}

export function useAudioRecorder({
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
}: UseAudioRecorderProps = {}): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      // Reset error state
      setError(null)
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        try {
          setIsProcessing(true)

          // Combine audio chunks into a single blob
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

          // Create form data for API request
          const formData = new FormData()
          formData.append("audio", audioBlob, "recording.webm")

          // Send to Whisper API
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status}`)
          }

          const data = await response.json()

          // Call the callback with the transcribed text
          if (data.text) {
            onTranscriptionComplete?.(data.text)
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error during transcription"
          setError(errorMessage)
          onError?.(errorMessage)
        } finally {
          setIsProcessing(false)

          // Stop all tracks in the stream
          if (mediaRecorderRef.current) {
            const tracks = mediaRecorderRef.current.stream.getTracks()
            tracks.forEach((track) => track.stop())
          }
        }
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      onRecordingStart?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start recording"
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }, [onTranscriptionComplete, onRecordingStart, onError])

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      onRecordingStop?.()
    }
  }, [isRecording, onRecordingStop])

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    isProcessing,
  }
}
