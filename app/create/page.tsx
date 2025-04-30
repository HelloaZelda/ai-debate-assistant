"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Clock, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function CreateDebatePage() {
  const [debateMode, setDebateMode] = useState("standard")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.target)

      // Extract form values
      const topic = formData.get("topic")
      const mode = formData.get("mode")
      const affirmative = formData.get("affirmative")
      const negative = formData.get("negative")

      // Extract time settings based on mode
      let timeSettings = {}

      if (mode === "standard") {
        timeSettings = {
          prepTime: Number.parseInt(formData.get("prep-time")) * 60, // convert to seconds
          openingTime: Number.parseInt(formData.get("opening-time")) * 60,
          debateTime: Number.parseInt(formData.get("debate-time")) * 60,
          freeTime: Number.parseInt(formData.get("free-time")) * 60,
          conclusionTime: Number.parseInt(formData.get("conclusion-time")) * 60,
        }
      } else {
        timeSettings = {
          prepTime: 120, // default 2 minutes
          totalTime: Number.parseInt(formData.get("total-time")) * 60,
          speechLimit: Number.parseInt(formData.get("speech-limit")) * 60,
          conclusionTime: 120, // default 2 minutes
        }
      }

      // Create debate
      const response = await fetch("/api/debates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          mode,
          affirmative,
          negative,
          timeSettings,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create debate")
      }

      const debate = await response.json()

      toast({
        title: "辩论创建成功",
        description: "正在跳转到辩论页面...",
      })

      router.push(`/debate?id=${debate.id}`)
    } catch (error) {
      console.error("Error creating debate:", error)
      toast({
        title: "创建失败",
        description: "发生未知错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">创建新辩论</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>辩论基本信息</CardTitle>
            <CardDescription>设置辩题、参与方和辩论规则</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">辩题</Label>
              <Textarea
                id="topic"
                name="topic"
                placeholder="输入辩论主题，例如：人工智能是否会取代人类工作"
                className="resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="affirmative">正方名称</Label>
                <Input id="affirmative" name="affirmative" placeholder="正方" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="negative">反方名称</Label>
                <Input id="negative" name="negative" placeholder="反方" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">辩论模式</Label>
              <Select defaultValue="standard" name="mode" onValueChange={(value) => setDebateMode(value)}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="选择辩论模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">标准模式</SelectItem>
                  <SelectItem value="free">自由模式</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>时间设置</Label>

              {debateMode === "standard" ? (
                <div className="space-y-4 border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep-time">准备阶段</Label>
                      <div className="flex items-center">
                        <Input
                          id="prep-time"
                          name="prep-time"
                          type="number"
                          defaultValue="2"
                          className="w-20"
                          min="1"
                          required
                        />
                        <span className="ml-2">分钟</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opening-time">开篇立论</Label>
                      <div className="flex items-center">
                        <Input
                          id="opening-time"
                          name="opening-time"
                          type="number"
                          defaultValue="3"
                          className="w-20"
                          min="1"
                          required
                        />
                        <span className="ml-2">分钟/方</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="debate-time">对辩环节</Label>
                      <div className="flex items-center">
                        <Input
                          id="debate-time"
                          name="debate-time"
                          type="number"
                          defaultValue="15"
                          className="w-20"
                          min="1"
                          required
                        />
                        <span className="ml-2">分钟</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="free-time">自由辩论</Label>
                      <div className="flex items-center">
                        <Input
                          id="free-time"
                          name="free-time"
                          type="number"
                          defaultValue="5"
                          className="w-20"
                          min="1"
                          required
                        />
                        <span className="ml-2">分钟</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="conclusion-time">结辩陈词</Label>
                      <div className="flex items-center">
                        <Input
                          id="conclusion-time"
                          name="conclusion-time"
                          type="number"
                          defaultValue="2"
                          className="w-20"
                          min="1"
                          required
                        />
                        <span className="ml-2">分钟/方</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-time">总时长</Label>
                      <div className="flex items-center">
                        <Input
                          id="total-time"
                          name="total-time"
                          type="number"
                          defaultValue="30"
                          className="w-20"
                          min="5"
                          required
                        />
                        <span className="ml-2">分钟</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="speech-limit">单次发言限时</Label>
                      <div className="flex items-center">
                        <Input
                          id="speech-limit"
                          name="speech-limit"
                          type="number"
                          defaultValue="2"
                          className="w-20"
                          min="1"
                          required
                        />
                        <span className="ml-2">分钟</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-level">AI辅助级别</Label>
              <Select defaultValue="medium" name="ai-level">
                <SelectTrigger id="ai-level">
                  <SelectValue placeholder="选择AI辅助级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">基础（仅计时提醒）</SelectItem>
                  <SelectItem value="medium">中级（含论点建议）</SelectItem>
                  <SelectItem value="high">高级（全面分析与建议）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button">
              <Save className="h-4 w-4 mr-2" />
              保存为模板
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Clock className="h-4 w-4 mr-2" />
              {isSubmitting ? "创建中..." : "开始辩论"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
