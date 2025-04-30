"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  ChevronLeft,
  Mic,
  MicOff,
  Pause,
  Play,
  SkipForward,
  Clock,
  Download,
  MessageSquare,
  Lightbulb,
} from "lucide-react"
import { useAudioRecorder } from "@/lib/use-audio-recorder"
import { useSpeechRecognition } from "@/lib/use-speech-recognition"
import { toast } from "@/components/ui/use-toast"

export default function DebatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const debateId = searchParams.get("id")

  const [debate, setDebate] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(true)
  const [currentPhase, setCurrentPhase] = useState(null)
  const [currentSpeaker, setCurrentSpeaker] = useState("affirmative")
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds
  const [progress, setProgress] = useState(100)
  const [transcripts, setTranscripts] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [summary, setSummary] = useState(null)

  const timerRef = useRef(null)
  const recordingStartTimeRef = useRef(null)

  // Speech recognition hook
  const {
    transcript,
    interimTranscript,
    isRecording: isSpeechRecording,
    startRecording: startSpeechRecording,
    stopRecording: stopSpeechRecording,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition({
    onTranscript: (text) => {
      // This is called when a final transcript is available
      console.log("Final transcript:", text)
    },
  })

  // Audio recorder hook (for Whisper API)
  const {
    isRecording: isAudioRecording,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    isProcessing: isTranscribing,
    error: audioError,
  } = useAudioRecorder({
    onTranscriptionComplete: (text) => {
      if (text.trim()) {
        saveTranscript(text)
      }
    },
    onError: (error) => {
      toast({
        title: "转写错误",
        description: error,
        variant: "destructive",
      })
    },
  })

  // Fetch debate data
  useEffect(() => {
    if (!debateId) {
      router.push("/")
      return
    }

    const fetchDebate = async () => {
      try {
        const response = await fetch(`/api/debates?id=${debateId}`)
        if (!response.ok) throw new Error("Failed to fetch debate")

        const data = await response.json()
        setDebate(data)

        // Set initial phase
        if (data.currentPhase) {
          setCurrentPhase(data.currentPhase)
          setTimeRemaining(data.currentPhase.duration)

          if (data.currentPhase.speaker) {
            setCurrentSpeaker(data.currentPhase.speaker)
          }
        }

        // Fetch transcripts
        const transcriptsResponse = await fetch(`/api/debates/transcripts?debateId=${debateId}`)
        if (transcriptsResponse.ok) {
          const transcriptsData = await transcriptsResponse.json()
          setTranscripts(transcriptsData)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching debate:", error)
        toast({
          title: "加载失败",
          description: "无法加载辩论数据，请重试",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    fetchDebate()
  }, [debateId, router])

  // Timer effect
  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsPaused(true)

            // Play sound alert
            const audio = new Audio("/sounds/timer-end.mp3")
            audio.play().catch((err) => console.error("Error playing sound:", err))

            toast({
              title: "时间到",
              description: "当前阶段时间已结束",
              variant: "destructive",
            })

            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (isPaused && timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, timeRemaining])

  // Update progress bar
  useEffect(() => {
    if (currentPhase) {
      const progressPercentage = (timeRemaining / currentPhase.duration) * 100
      setProgress(progressPercentage)
    }
  }, [timeRemaining, currentPhase])

  // Handle speech recognition errors
  useEffect(() => {
    if (speechError) {
      toast({
        title: "语音识别错误",
        description: speechError,
        variant: "destructive",
      })
    }
  }, [speechError])

  // Handle audio recording errors
  useEffect(() => {
    if (audioError) {
      toast({
        title: "录音错误",
        description: audioError,
        variant: "destructive",
      })
    }
  }, [audioError])

  // Toggle recording
  const toggleRecording = () => {
    if (isAudioRecording || isSpeechRecording) {
      // Stop recording
      if (isAudioRecording) {
        stopAudioRecording()
      }
      if (isSpeechRecording) {
        stopSpeechRecording()

        // Save transcript if not empty
        if (transcript.trim()) {
          saveTranscript(transcript)
          resetTranscript()
        }
      }

      recordingStartTimeRef.current = null
    } else {
      // Start recording
      // Choose which recording method to use
      // For this implementation, we'll use the Web Speech API for real-time feedback
      // and fall back to Whisper API if needed
      try {
        startSpeechRecording()
        recordingStartTimeRef.current = Date.now()
      } catch (error) {
        console.error("Error starting speech recognition:", error)

        // Fall back to Whisper API
        toast({
          title: "使用备用语音识别",
          description: "Web Speech API不可用，使用Whisper API",
        })

        startAudioRecording()
        recordingStartTimeRef.current = Date.now()
      }
    }
  }

  // Save transcript
  const saveTranscript = async (content) => {
    if (!debateId) return

    try {
      const speaker =
        currentSpeaker === "both" ? (transcripts.length % 2 === 0 ? "affirmative" : "negative") : currentSpeaker

      const response = await fetch("/api/debates/transcripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debateId,
          content,
          speaker,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save transcript")
      }

      const newTranscript = await response.json()

      // Update transcripts
      setTranscripts((prev) => [...prev, newTranscript])

      // Generate new AI suggestion
      generateSuggestion(speaker)
    } catch (error) {
      console.error("Error saving transcript:", error)
      toast({
        title: "保存失败",
        description: "无法保存转写内容",
        variant: "destructive",
      })
    }
  }

  // Toggle timer pause/play
  const toggleTimer = () => {
    setIsPaused(!isPaused)
  }

  // Move to next phase
  const nextPhase = async () => {
    if (!debate || !currentPhase) return

    // Find next phase
    const currentIndex = debate.phases.findIndex((p) => p.id === currentPhase.id)
    if (currentIndex < debate.phases.length - 1) {
      const nextPhase = debate.phases[currentIndex + 1]

      try {
        const response = await fetch("/api/debates/phase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            debateId,
            phaseId: nextPhase.id,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update phase")
        }

        const data = await response.json()

        if (data.success) {
          setCurrentPhase(nextPhase)
          setTimeRemaining(nextPhase.duration)
          setIsPaused(true)

          // Update current speaker based on phase
          if (nextPhase.speaker) {
            setCurrentSpeaker(nextPhase.speaker)
          }

          // Stop recording if active
          if (isAudioRecording) {
            stopAudioRecording()
          }
          if (isSpeechRecording) {
            stopSpeechRecording()
            resetTranscript()
          }

          toast({
            title: "阶段切换",
            description: `已切换到: ${nextPhase.name}`,
          })
        }
      } catch (error) {
        console.error("Error updating phase:", error)
        toast({
          title: "切换失败",
          description: "无法切换到下一阶段",
          variant: "destructive",
        })
      }
    } else {
      // End debate
      toast({
        title: "辩论结束",
        description: "辩论已成功结束",
      })

      // Generate final summary
      generateSummary()
    }
  }

  // Generate AI suggestion
  const generateSuggestion = async (speakerForSuggestion = currentSpeaker) => {
    if (!debateId) return

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debateId,
          currentSpeaker: speakerForSuggestion === "both" ? "affirmative" : speakerForSuggestion,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate suggestion")
      }

      const suggestion = await response.json()
      setSuggestions((prev) => [suggestion, ...prev].slice(0, 10))
    } catch (error) {
      console.error("Error generating suggestion:", error)
      toast({
        title: "生成建议失败",
        description: "无法生成AI建议",
        variant: "destructive",
      })
    }
  }

  // Generate debate summary
  const generateSummary = async () => {
    if (!debateId) return

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debateId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const summary = await response.json()
      setSummary(summary)
    } catch (error) {
      console.error("Error generating summary:", error)
      toast({
        title: "生成摘要失败",
        description: "无法生成辩论摘要",
        variant: "destructive",
      })
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>加载辩论数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              退出辩论
            </Button>
          </Link>
          <h1 className="text-xl font-bold">辩题：{debate?.topic || "加载中..."}</h1>
        </div>
        <Badge variant="outline" className="text-sm">
          {debate?.mode === "standard" ? "标准模式" : "自由模式"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Timer and controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{currentPhase?.name || "准备阶段"}</CardTitle>
              <CardDescription>
                {currentSpeaker === "affirmative"
                  ? `正方 (${debate?.affirmative}) 发言`
                  : currentSpeaker === "negative"
                    ? `反方 (${debate?.negative}) 发言`
                    : "双方交流"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className={`text-5xl font-bold mb-4 ${timeRemaining < 30 ? "text-red-500" : ""}`}>
                  {formatTime(timeRemaining)}
                </div>
                <Progress value={progress} className="w-full h-2 mb-4" />
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={toggleTimer}>
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextPhase}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={isAudioRecording || isSpeechRecording ? "destructive" : "default"}
                    size="icon"
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                  >
                    {isAudioRecording || isSpeechRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isTranscribing && <div className="mt-2 text-sm text-muted-foreground">正在处理录音...</div>}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>当前阶段</span>
                  <span>下一阶段</span>
                </div>
                <div className="flex justify-between">
                  <Badge variant="secondary">{currentPhase?.name || "准备阶段"}</Badge>
                  <Badge variant="outline">
                    {currentPhase && debate?.phases.indexOf(currentPhase) === debate.phases.length - 1
                      ? "辩论结束"
                      : (currentPhase && debate?.phases[debate.phases.indexOf(currentPhase) + 1]?.name) || ""}
                  </Badge>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">辩论进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {debate?.phases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        currentPhase?.id === phase.id
                          ? "bg-green-500 animate-pulse"
                          : index < debate.phases.indexOf(currentPhase)
                            ? "bg-gray-400"
                            : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                    <span className={`text-sm ${currentPhase?.id === phase.id ? "font-medium" : ""}`}>
                      {phase.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle column - Transcription */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="transcription" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcription">实时转写</TabsTrigger>
              <TabsTrigger value="ai-suggestions">AI建议</TabsTrigger>
              <TabsTrigger value="summary">辩论摘要</TabsTrigger>
            </TabsList>
            <TabsContent value="transcription" className="mt-4">
              <Card className="h-[calc(100vh-220px)] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    实时转写
                    {(isAudioRecording || isSpeechRecording) && (
                      <Badge variant="secondary" className="ml-2 animate-pulse">
                        <span className="mr-1">●</span> 录音中
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                  <div className="space-y-4">
                    {transcripts.map((transcript, index) => (
                      <div
                        key={index}
                        className={`p-3 ${
                          transcript.speaker === "affirmative"
                            ? "bg-blue-50 dark:bg-blue-950"
                            : "bg-red-50 dark:bg-red-950"
                        } rounded-lg`}
                      >
                        <div
                          className={`font-medium mb-1 ${
                            transcript.speaker === "affirmative"
                              ? "text-blue-800 dark:text-blue-300"
                              : "text-red-800 dark:text-red-300"
                          }`}
                        >
                          {transcript.speaker === "affirmative" ? debate?.affirmative : debate?.negative}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">{transcript.content}</p>
                      </div>
                    ))}

                    {/* Show interim transcript during recording */}
                    {(transcript || interimTranscript) && (
                      <div
                        className={`p-3 ${
                          currentSpeaker === "both"
                            ? transcripts.length % 2 === 0
                              ? "bg-blue-50 dark:bg-blue-950"
                              : "bg-red-50 dark:bg-red-950"
                            : currentSpeaker === "affirmative"
                              ? "bg-blue-50 dark:bg-blue-950"
                              : "bg-red-50 dark:bg-red-950"
                        } rounded-lg`}
                      >
                        <div
                          className={`font-medium mb-1 ${
                            currentSpeaker === "both"
                              ? transcripts.length % 2 === 0
                                ? "text-blue-800 dark:text-blue-300"
                                : "text-red-800 dark:text-red-300"
                              : currentSpeaker === "affirmative"
                                ? "text-blue-800 dark:text-blue-300"
                                : "text-red-800 dark:text-red-300"
                          }`}
                        >
                          {currentSpeaker === "both"
                            ? transcripts.length % 2 === 0
                              ? debate?.affirmative
                              : debate?.negative
                            : currentSpeaker === "affirmative"
                              ? debate?.affirmative
                              : debate?.negative}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">
                          {transcript}
                          {interimTranscript && <span className="text-gray-500 italic"> {interimTranscript}</span>}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <div className="flex justify-between w-full">
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      标记时间点
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      导出记录
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="ai-suggestions" className="mt-4">
              <Card className="h-[calc(100vh-220px)] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    AI建议
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                  <div className="space-y-4">
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="font-medium mb-2 flex items-center">
                            <AlertCircle
                              className={`h-4 w-4 mr-2 ${
                                suggestion.type === "argument"
                                  ? "text-amber-500"
                                  : suggestion.type === "logic"
                                    ? "text-blue-500"
                                    : suggestion.type === "evidence"
                                      ? "text-green-500"
                                      : "text-purple-500"
                              }`}
                            />
                            {suggestion.type === "argument"
                              ? "论点建议"
                              : suggestion.type === "logic"
                                ? "逻辑分析"
                                : suggestion.type === "evidence"
                                  ? "证据支持"
                                  : suggestion.type === "rebuttal"
                                    ? "反驳建议"
                                    : "建议"}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{suggestion.suggestion}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">暂无AI建议，请开始辩论后再查看</div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => generateSuggestion()}
                    disabled={transcripts.length === 0}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    获取新建议
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="summary" className="mt-4">
              <Card className="h-[calc(100vh-220px)] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">辩论摘要</CardTitle>
                  <CardDescription>AI自动生成的辩论要点总结</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                  {summary ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-medium mb-2">摘要</h3>
                        <p className="text-gray-700 dark:text-gray-300">{summary.summary}</p>
                      </div>

                      <div>
                        <h3 className="text-md font-medium mb-2">正方主要论点</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {summary.affirmativePoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-md font-medium mb-2">反方主要论点</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {summary.negativePoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-md font-medium mb-2">关键争议点</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {summary.keyIssues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>

                      {summary.highlight && (
                        <div>
                          <h3 className="text-md font-medium mb-2">精彩瞬间</h3>
                          <div className="border-l-4 border-gray-300 pl-4 py-2 italic">
                            "{summary.highlight.content}"
                            <div className="text-sm text-muted-foreground mt-1">
                              — {summary.highlight.speaker === "affirmative" ? debate?.affirmative : debate?.negative}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {transcripts.length > 0 ? "点击下方按钮生成辩论摘要" : "暂无辩论记录，请先开始辩论"}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={generateSummary}
                    disabled={transcripts.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {summary ? "更新摘要" : "生成摘要"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
