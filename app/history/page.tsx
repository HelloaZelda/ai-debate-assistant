"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Download, Eye, BarChart2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function HistoryPage() {
  const [debates, setDebates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDebates: 0,
    totalDuration: 0,
    standardModeCount: 0,
    freeModeCount: 0,
  })

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const response = await fetch("/api/debates")
        if (!response.ok) throw new Error("Failed to fetch debates")

        const data = await response.json()
        setDebates(data)

        // Calculate stats
        const totalDuration = data.reduce((sum, debate) => {
          return sum + (debate.statistics?.totalDuration || 0)
        }, 0)

        const standardModeCount = data.filter((d) => d.mode === "standard").length
        const freeModeCount = data.filter((d) => d.mode === "free").length

        setStats({
          totalDebates: data.length,
          totalDuration,
          standardModeCount,
          freeModeCount,
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching debates:", error)
        toast({
          title: "加载失败",
          description: "无法加载辩论历史记录，请重试",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchDebates()
  }, [])

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Format date as YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  // Format total duration as H:MM:SS
  const formatTotalDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">历史辩论记录</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>辩论历史</CardTitle>
          <CardDescription>查看和管理您的历史辩论记录</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>加载辩论历史记录中...</p>
            </div>
          ) : debates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>辩题</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>模式</TableHead>
                  <TableHead>时长</TableHead>
                  <TableHead>正方</TableHead>
                  <TableHead>反方</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debates.map((debate) => (
                  <TableRow key={debate.id}>
                    <TableCell className="font-medium">{debate.topic}</TableCell>
                    <TableCell>{formatDate(debate.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{debate.mode === "standard" ? "标准模式" : "自由模式"}</Badge>
                    </TableCell>
                    <TableCell>{formatTime(debate.statistics?.totalDuration || 0)}</TableCell>
                    <TableCell>{debate.affirmative}</TableCell>
                    <TableCell>{debate.negative}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/debate?id=${debate.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            查看
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          导出
                        </Button>
                        <Link href={`/statistics?id=${debate.id}`}>
                          <Button variant="outline" size="sm">
                            <BarChart2 className="h-4 w-4 mr-2" />
                            分析
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">暂无辩论历史记录，请先创建一场辩论</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">总辩论次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDebates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">总辩论时长</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatTotalDuration(stats.totalDuration)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">标准模式</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.standardModeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">自由模式</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.freeModeCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
