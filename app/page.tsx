"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { DebateTimer } from "@/components/debate-timer"
import { SettingsDialog } from "@/components/settings-dialog"

export default function HomePage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDebateStarted, setIsDebateStarted] = useState(false)
  const [debateSettings, setDebateSettings] = useState({
    affirmative: "正方",
    negative: "反方",
    openingTime: 180, // 3 minutes in seconds
    freeDebateTime: 240, // 4 minutes in seconds
    closingTime: 180, // 3 minutes in seconds
  })

  const handleStartDebate = () => {
    setIsDebateStarted(true)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">辩论计时器</h1>
          {!isDebateStarted && <Button onClick={() => setIsSettingsOpen(true)}>设置</Button>}
        </div>
        <div className="text-sm text-gray-500">
          作者: @你好塞尔达 | 基于 Next.js + React 
        </div>
      </div>

      {!isDebateStarted ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>开始新辩论</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>正方名称</Label>
              <div className="font-medium">{debateSettings.affirmative}</div>
            </div>
            <div className="space-y-2">
              <Label>反方名称</Label>
              <div className="font-medium">{debateSettings.negative}</div>
            </div>
            <div className="space-y-2">
              <Label>开场陈词时间</Label>
              <div className="font-medium">{Math.floor(debateSettings.openingTime / 60)}分钟</div>
            </div>
            <div className="space-y-2">
              <Label>自由辩论时间</Label>
              <div className="font-medium">{Math.floor(debateSettings.freeDebateTime / 60)}分钟</div>
            </div>
            <div className="space-y-2">
              <Label>总结陈词时间</Label>
              <div className="font-medium">{Math.floor(debateSettings.closingTime / 60)}分钟</div>
            </div>
            <Button className="w-full" onClick={handleStartDebate}>
              开始辩论
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DebateTimer settings={debateSettings} onReset={() => setIsDebateStarted(false)} />
      )}

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={debateSettings}
        onSave={setDebateSettings}
      />
    </div>
  )
}
