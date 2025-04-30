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
        } else if (currentPhase.speaker !== "qa") {
          // 普通计时模式
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
  }, [isPaused, currentPhase.speaker, activeSpeaker])

  // 更新进度条
  useEffect(() => {
    if (currentPhase.speaker === "both") {
      if (activeSpeaker === "affirmative") {
        setProgress((affirmativeTimeRemaining / settings.freeDebateTime) * 100)
      } else if (activeSpeaker === "negative") {
        setProgress((negativeTimeRemaining / settings.freeDebateTime) * 100)
      }
    } else if (currentPhase.speaker !== "qa" && currentPhase.duration > 0) {
      setProgress((timeRemaining / currentPhase.duration) * 100)
    }
  }, [
    timeRemaining,
    affirmativeTimeRemaining,
    negativeTimeRemaining,
    activeSpeaker,
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
    if (currentPhase.speaker === "qa") return
    if (currentPhase.speaker === "both" && !activeSpeaker) return

    setIsPaused((prev) => !prev)
  }

  // 设置自由辩论发言方
  const setFreeSpeaker = (speaker: "affirmative" | "negative") => {
    if (currentPhase.speaker !== "both") return

    setActiveSpeaker(speaker)
    setIsPaused(false)
  }

  // 格式化时间为MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
            <div className="text-center py-6">
              <div className="text-2xl font-bold mb-4">提问环节</div>
              <div className="text-gray-500 mb-6">
                {currentPhase.id === "qa_aff" ? "正方" : "反方"}接受提问，无时间限制
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
              disabled={currentPhase.speaker === "qa" || (currentPhase.speaker === "both" && !activeSpeaker)}
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
