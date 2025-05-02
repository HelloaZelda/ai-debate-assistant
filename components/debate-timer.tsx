"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Play, Pause, SkipForward, X } from "lucide-react"
import { RecordingPermission } from "./recording-permission"
import { AudioRecorder } from "./audio-recorder"
import { TranscriptionDisplay } from "./transcription-display"

// 辩论阶段定义
type DebatePhase = {
  id: string
  name: string
  duration: number // in seconds
  speaker: "affirmative" | "negative" | "both" | "qa"
}

type DebateTimerProps = {
  settings: {
    affirmative: string
    negative: string
    openingTime: number
    freeDebateTime: number
    closingTime: number
  }
  onReset: () => void
}

export function DebateTimer({ settings, onReset }: DebateTimerProps) {
  // 创建辩论阶段
  const phases = [
    { id: "opening_aff", name: "开场陈词 (正方一辩)", duration: settings.openingTime, speaker: "affirmative" },
    { id: "opening_neg", name: "开场陈词 (反方一辩)", duration: settings.openingTime, speaker: "negative" },
    { id: "free_debate", name: "自由辩论", duration: settings.freeDebateTime, speaker: "both" },
    { id: "qa_aff", name: "正方提问环节", duration: 0, speaker: "qa" },
    { id: "qa_neg", name: "反方提问环节", duration: 0, speaker: "qa" },
    { id: "closing_aff", name: "总结陈词 (正方四辩)", duration: settings.closingTime, speaker: "affirmative" },
    { id: "closing_neg", name: "总结陈词 (反方四辩)", duration: settings.closingTime, speaker: "negative" },
  ]

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(phases[0].duration)
  const [isPaused, setIsPaused] = useState(true)
  const [progress, setProgress] = useState(100)
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false)

  // 自由辩论特殊处理
  const [activeSpeaker, setActiveSpeaker] = useState<"affirmative" | "negative" | null>(null)
  const [affirmativeTimeRemaining, setAffirmativeTimeRemaining] = useState(settings.freeDebateTime)
  const [negativeTimeRemaining, setNegativeTimeRemaining] = useState(settings.freeDebateTime)

  // QA section special handling
  const [qaAffirmativeTimeRemaining, setQaAffirmativeTimeRemaining] = useState(40) // 40 seconds for QA
  const [qaNegativeTimeRemaining, setQaNegativeTimeRemaining] = useState(40) // 40 seconds for QA
  const [qaActiveSpeaker, setQaActiveSpeaker] = useState<"affirmative" | "negative" | null>(null)
  const [affirmativeAnswerCount, setAffirmativeAnswerCount] = useState(0)
  const [negativeAnswerCount, setNegativeAnswerCount] = useState(0)
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)

  // Transcription state
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [affirmativeTranscription, setAffirmativeTranscription] = useState("")
  const [negativeTranscription, setNegativeTranscription] = useState("")

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const currentPhase = phases[currentPhaseIndex]

  // 计时器效果
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        if (currentPhase.speaker === "both") {
          // 自由辩论模式
          if (activeSpeaker === "affirmative") {
            setAffirmativeTimeRemaining((prev) => {
              if (prev <= 1) {
                setIsPaused(true)
                clearInterval(timerRef.current!)
                return 0
              }
              return prev - 1
            })
          } else if (activeSpeaker === "negative") {
            setNegativeTimeRemaining((prev) => {
              if (prev <= 1) {
                setIsPaused(true)
                clearInterval(timerRef.current!)
                return 0
              }
              return prev - 1
            })
          }
        } else if (currentPhase.speaker === "qa") {
          // QA mode
          if (qaActiveSpeaker === "affirmative") {
            setQaAffirmativeTimeRemaining((prev) => {
              if (prev <= 1) {
                setQaActiveSpeaker(null)
                setIsPaused(true)
                clearInterval(timerRef.current!)
                return 40 // Reset to 40 seconds
              }
              return prev - 1
            })
          } else if (qaActiveSpeaker === "negative") {
            setQaNegativeTimeRemaining((prev) => {
              if (prev <= 1) {
                setQaActiveSpeaker(null)
                setIsPaused(true)
                clearInterval(timerRef.current!)
                return 40 // Reset to 40 seconds
              }
              return prev - 1
            })
          }
        } else {
          // Normal timing mode
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              setIsPaused(true)
              clearInterval(timerRef.current!)
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, currentPhase.speaker, activeSpeaker, qaActiveSpeaker])

  // 更新进度条
  useEffect(() => {
    if (currentPhase.speaker === "both") {
      if (activeSpeaker === "affirmative") {
        setProgress((affirmativeTimeRemaining / settings.freeDebateTime) * 100)
      } else if (activeSpeaker === "negative") {
        setProgress((negativeTimeRemaining / settings.freeDebateTime) * 100)
      }
    } else if (currentPhase.speaker === "qa") {
      if (qaActiveSpeaker === "affirmative") {
        setProgress((qaAffirmativeTimeRemaining / 40) * 100)
      } else if (qaActiveSpeaker === "negative") {
        setProgress((qaNegativeTimeRemaining / 40) * 100)
      } else {
        setProgress(100)
      }
    } else if (currentPhase.speaker !== "qa" && currentPhase.duration > 0) {
      setProgress((timeRemaining / currentPhase.duration) * 100)
    }
  }, [
    timeRemaining,
    affirmativeTimeRemaining,
    negativeTimeRemaining,
    qaAffirmativeTimeRemaining,
    qaNegativeTimeRemaining,
    activeSpeaker,
    qaActiveSpeaker,
    currentPhase,
    settings.freeDebateTime,
  ])

  // 切换到下一阶段
  const nextPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex((prev) => prev + 1)
      const nextPhase = phases[currentPhaseIndex + 1]

      // 重置计时器状态
      setIsPaused(true)
      setActiveSpeaker(null)
      setQaActiveSpeaker(null)

      if (nextPhase.speaker !== "both" && nextPhase.speaker !== "qa") {
        setTimeRemaining(nextPhase.duration)
      }
    } else {
      // 辩论结束
      setIsEndDialogOpen(true)
    }
  }

  // 切换暂停/播放
  const togglePause = () => {
    // 只有在非QA环节且有活跃发言方时才能切换暂停状态
    if (currentPhase.speaker === "qa") {
      if (!qaActiveSpeaker) return
    } else if (currentPhase.speaker === "both" && !activeSpeaker) {
      return
    }

    setIsPaused((prev) => !prev)
  }

  // 设置自由辩论发言方
  const setFreeSpeaker = (speaker: "affirmative" | "negative") => {
    if (currentPhase.speaker !== "both") return

    setActiveSpeaker(speaker)
    setIsPaused(false)
  }

  // Set QA speaker
  const startQaTimer = (speaker: "affirmative" | "negative") => {
    if (currentPhase.speaker !== "qa") return

    // If the same speaker is clicked again, toggle off
    if (qaActiveSpeaker === speaker) {
      setQaActiveSpeaker(null)
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      return
    }

    // Don't allow starting if the other speaker is already speaking
    if (qaActiveSpeaker && qaActiveSpeaker !== speaker) return

    setQaActiveSpeaker(speaker)
    setIsPaused(false)

    // Increment answer count only when starting a new answer
    if (speaker === "affirmative") {
      setAffirmativeAnswerCount((prev) => prev + 1)
    } else {
      setNegativeAnswerCount((prev) => prev + 1)
    }
  }

  // 格式化时间为MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle microphone permission change
  const handleMicPermissionChange = (granted: boolean) => {
    setMicPermissionGranted(granted)
  }

  // Handle transcription updates
  const handleAffirmativeTranscription = (text: string) => {
    setAffirmativeTranscription(text)
  }

  const handleNegativeTranscription = (text: string) => {
    setNegativeTranscription(text)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{currentPhase.name}</span>
            <Badge variant={isPaused ? "outline" : "default"}>{isPaused ? "已暂停" : "计时中"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPhase.speaker === "both" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className={`border-2 ${activeSpeaker === "affirmative" ? "border-blue-500" : "border-gray-200"}`}>
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg">{settings.affirmative}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div
                      className={`text-4xl font-bold text-center ${affirmativeTimeRemaining < 30 ? "text-red-500" : ""}`}
                    >
                      {formatTime(affirmativeTimeRemaining)}
                    </div>
                    <Progress
                      value={
                        activeSpeaker === "affirmative"
                          ? progress
                          : (affirmativeTimeRemaining / settings.freeDebateTime) * 100
                      }
                      className="h-2 mt-2"
                    />
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button
                      className="w-full"
                      variant={activeSpeaker === "affirmative" ? "default" : "outline"}
                      onClick={() => setFreeSpeaker("affirmative")}
                      disabled={affirmativeTimeRemaining <= 0}
                    >
                      {activeSpeaker === "affirmative" ? "正在发言" : "开始发言"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className={`border-2 ${activeSpeaker === "negative" ? "border-blue-500" : "border-gray-200"}`}>
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg">{settings.negative}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div
                      className={`text-4xl font-bold text-center ${negativeTimeRemaining < 30 ? "text-red-500" : ""}`}
                    >
                      {formatTime(negativeTimeRemaining)}
                    </div>
                    <Progress
                      value={
                        activeSpeaker === "negative"
                          ? progress
                          : (negativeTimeRemaining / settings.freeDebateTime) * 100
                      }
                      className="h-2 mt-2"
                    />
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button
                      className="w-full"
                      variant={activeSpeaker === "negative" ? "default" : "outline"}
                      onClick={() => setFreeSpeaker("negative")}
                      disabled={negativeTimeRemaining <= 0}
                    >
                      {activeSpeaker === "negative" ? "正在发言" : "开始发言"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={togglePause} disabled={!activeSpeaker}>
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? "继续" : "暂停"}
                </Button>
              </div>
            </div>
          ) : currentPhase.speaker === "qa" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`border-2 ${qaActiveSpeaker === "affirmative" ? "border-blue-500" : "border-gray-200"}`}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{settings.affirmative}</span>
                      <Badge variant="outline">已回答: {affirmativeAnswerCount}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div
                      className={`text-4xl font-bold text-center ${
                        qaActiveSpeaker === "affirmative" && qaAffirmativeTimeRemaining < 10 ? "text-red-500" : ""
                      }`}
                    >
                      {qaActiveSpeaker === "affirmative" ? formatTime(qaAffirmativeTimeRemaining) : "00:40"}
                    </div>
                    <Progress
                      value={qaActiveSpeaker === "affirmative" ? (qaAffirmativeTimeRemaining / 40) * 100 : 100}
                      className="h-2 mt-2"
                    />
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex-col gap-2">
                    <Button
                      className="w-full"
                      variant={qaActiveSpeaker === "affirmative" ? "default" : "outline"}
                      onClick={() => startQaTimer("affirmative")}
                      disabled={qaActiveSpeaker !== null && qaActiveSpeaker !== "affirmative"}
                    >
                      {qaActiveSpeaker === "affirmative" ? "结束回答" : "正方回答"}
                    </Button>

                    {micPermissionGranted && (
                      <AudioRecorder
                        disabled={qaActiveSpeaker !== "affirmative"}
                        enableTranscription={true}
                        onTranscriptionUpdate={handleAffirmativeTranscription}
                      />
                    )}
                  </CardFooter>

                  {qaActiveSpeaker === "affirmative" && (
                    <TranscriptionDisplay
                      text={affirmativeTranscription}
                      isTranscribing={isTranscribing && qaActiveSpeaker === "affirmative"}
                      speaker={settings.affirmative}
                    />
                  )}
                </Card>

                <Card className={`border-2 ${qaActiveSpeaker === "negative" ? "border-blue-500" : "border-gray-200"}`}>
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{settings.negative}</span>
                      <Badge variant="outline">已回答: {negativeAnswerCount}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div
                      className={`text-4xl font-bold text-center ${
                        qaActiveSpeaker === "negative" && qaNegativeTimeRemaining < 10 ? "text-red-500" : ""
                      }`}
                    >
                      {qaActiveSpeaker === "negative" ? formatTime(qaNegativeTimeRemaining) : "00:40"}
                    </div>
                    <Progress
                      value={qaActiveSpeaker === "negative" ? (qaNegativeTimeRemaining / 40) * 100 : 100}
                      className="h-2 mt-2"
                    />
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex-col gap-2">
                    <Button
                      className="w-full"
                      variant={qaActiveSpeaker === "negative" ? "default" : "outline"}
                      onClick={() => startQaTimer("negative")}
                      disabled={qaActiveSpeaker !== null && qaActiveSpeaker !== "negative"}
                    >
                      {qaActiveSpeaker === "negative" ? "结束回答" : "反方回答"}
                    </Button>

                    {micPermissionGranted && (
                      <AudioRecorder
                        disabled={qaActiveSpeaker !== "negative"}
                        enableTranscription={true}
                        onTranscriptionUpdate={handleNegativeTranscription}
                      />
                    )}
                  </CardFooter>

                  {qaActiveSpeaker === "negative" && (
                    <TranscriptionDisplay
                      text={negativeTranscription}
                      isTranscribing={isTranscribing && qaActiveSpeaker === "negative"}
                      speaker={settings.negative}
                    />
                  )}
                </Card>
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={togglePause} disabled={!qaActiveSpeaker}>
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? "继续" : "暂停"}
                </Button>

                <div className="flex items-center">
                  <RecordingPermission onPermissionChange={handleMicPermissionChange} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className={`text-6xl font-bold ${timeRemaining < 30 ? "text-red-500" : ""}`}>
                  {formatTime(timeRemaining)}
                </div>
                <Progress value={progress} className="w-full h-2 mt-4" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={togglePause}
              disabled={
                (currentPhase.speaker === "qa" && !qaActiveSpeaker) ||
                (currentPhase.speaker === "both" && !activeSpeaker)
              }
            >
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? "继续" : "暂停"}
            </Button>
            <Button variant="outline" onClick={nextPhase}>
              <SkipForward className="h-4 w-4 mr-2" />
              下一阶段
            </Button>
          </div>
          <Button variant="destructive" onClick={() => setIsEndDialogOpen(true)}>
            <X className="h-4 w-4 mr-2" />
            结束辩论
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>辩论进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    index === currentPhaseIndex
                      ? "bg-green-500 animate-pulse"
                      : index < currentPhaseIndex
                        ? "bg-gray-400"
                        : "bg-gray-200"
                  }`}
                />
                <span className={`text-sm ${index === currentPhaseIndex ? "font-medium" : ""}`}>{phase.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>结束辩论</AlertDialogTitle>
            <AlertDialogDescription>确定要结束当前辩论吗？这将重置所有计时器。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onReset}>确认结束</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
