"use client"

import { useState, useEffect, useRef } from "react"

interface UseSpeechRecognitionProps {
  onTranscript?: (transcript: string) => void
  onInterimTranscript?: (transcript: string) => void
  language?: string
  continuous?: boolean
}

interface UseSpeechRecognitionReturn {
  transcript: string
  interimTranscript: string
  isRecording: boolean
  startRecording: () => void
  stopRecording: () => void
  resetTranscript: () => void
  error: string | null
}

// Define the SpeechRecognition type
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: (event: any) => void
  onerror: (event: any) => void
  onend: (event: any) => void
}

// Define the window with SpeechRecognition
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: new () => SpeechRecognition
  webkitSpeechRecognition?: new () => SpeechRecognition
}

export function useSpeechRecognition({
  onTranscript,
  onInterimTranscript,
  language = "zh-CN",
  continuous = true,
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return

    const windowWithSpeech = window as WindowWithSpeechRecognition
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event) => {
      let finalTranscript = ""
      let currentInterimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          currentInterimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => {
          const newTranscript = prev + finalTranscript + " "
          onTranscript?.(newTranscript)
          return newTranscript
        })
      }

      setInterimTranscript(currentInterimTranscript)
      onInterimTranscript?.(currentInterimTranscript)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event)
      setError(`Speech recognition error: ${event.error}`)
    }

    recognition.onend = () => {
      if (isRecording) {
        // If still supposed to be recording, restart
        recognition.start()
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, language, onTranscript, onInterimTranscript, isRecording])

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported or not initialized.")
      return
    }

    try {
      recognitionRef.current.start()
      setIsRecording(true)
      setError(null)
    } catch (err) {
      console.error("Error starting speech recognition:", err)
      setError("Failed to start speech recognition.")
    }
  }

  const stopRecording = () => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
      setIsRecording(false)
    } catch (err) {
      console.error("Error stopping speech recognition:", err)
    }
  }

  const resetTranscript = () => {
    setTranscript("")
    setInterimTranscript("")
  }

  return {
    transcript,
    interimTranscript,
    isRecording,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
  }
}
