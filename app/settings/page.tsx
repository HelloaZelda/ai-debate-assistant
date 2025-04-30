import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Save } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="debate">辩论设置</TabsTrigger>
          <TabsTrigger value="ai">AI助手设置</TabsTrigger>
          <TabsTrigger value="advanced">高级设置</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>基本设置</CardTitle>
              <CardDescription>调整应用的基本配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">界面语言</Label>
                <Select defaultValue="zh-CN">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="zh-TW">繁体中文</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">界面主题</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="选择主题" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">通知提醒</Label>
                  <div className="text-sm text-muted-foreground">接收辩论相关的通知</div>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound">声音效果</Label>
                  <div className="text-sm text-muted-foreground">计时器和状态变化的声音提示</div>
                </div>
                <Switch id="sound" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="debate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>辩论设置</CardTitle>
              <CardDescription>自定义辩论规则和流程</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-mode">默认辩论模式</Label>
                <Select defaultValue="standard">
                  <SelectTrigger id="default-mode">
                    <SelectValue placeholder="选择默认模式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准模式</SelectItem>
                    <SelectItem value="free">自由模式</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>默认时间设置（标准模式）</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep-time">准备阶段</Label>
                    <div className="flex items-center">
                      <Input id="prep-time" type="number" defaultValue="2" className="w-20" />
                      <span className="ml-2">分钟</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opening-time">开篇立论</Label>
                    <div className="flex items-center">
                      <Input id="opening-time" type="number" defaultValue="3" className="w-20" />
                      <span className="ml-2">分钟/方</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debate-time">对辩环节</Label>
                    <div className="flex items-center">
                      <Input id="debate-time" type="number" defaultValue="15" className="w-20" />
                      <span className="ml-2">分钟</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="free-time">自由辩论</Label>
                    <div className="flex items-center">
                      <Input id="free-time" type="number" defaultValue="5" className="w-20" />
                      <span className="ml-2">分钟</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conclusion-time">结辩陈词</Label>
                    <div className="flex items-center">
                      <Input id="conclusion-time" type="number" defaultValue="2" className="w-20" />
                      <span className="ml-2">分钟/方</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="timer-warning">计时器警告</Label>
                  <div className="text-sm text-muted-foreground">时间即将结束时显示警告</div>
                </div>
                <Switch id="timer-warning" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warning-time">警告时间</Label>
                <div className="flex items-center">
                  <Input id="warning-time" type="number" defaultValue="30" className="w-20" />
                  <span className="ml-2">秒</span>
                </div>
                <div className="text-sm text-muted-foreground">剩余时间少于此值时显示警告</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI助手设置</CardTitle>
              <CardDescription>配置AI辅助功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ai-level">默认AI辅助级别</Label>
                <Select defaultValue="medium">
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="real-time-suggestions">实时建议</Label>
                  <div className="text-sm text-muted-foreground">在辩论过程中提供实时建议</div>
                </div>
                <Switch id="real-time-suggestions" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-summary">自动生成摘要</Label>
                  <div className="text-sm text-muted-foreground">辩论结束后自动生成摘要</div>
                </div>
                <Switch id="auto-summary" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="logic-check">逻辑检查</Label>
                  <div className="text-sm text-muted-foreground">检测辩论中的逻辑漏洞</div>
                </div>
                <Switch id="logic-check" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestion-frequency">建议频率</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="suggestion-frequency">
                    <SelectValue placeholder="选择建议频率" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低（仅关键时刻）</SelectItem>
                    <SelectItem value="medium">中（适度建议）</SelectItem>
                    <SelectItem value="high">高（频繁建议）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>高级设置</CardTitle>
              <CardDescription>高级功能配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="speech-recognition">语音识别模型</Label>
                <Select defaultValue="standard">
                  <SelectTrigger id="speech-recognition">
                    <SelectValue placeholder="选择语音识别模型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准模型</SelectItem>
                    <SelectItem value="enhanced">增强模型（更高准确度）</SelectItem>
                    <SelectItem value="fast">快速模型（低延迟）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-storage">数据存储位置</Label>
                <Select defaultValue="local">
                  <SelectTrigger id="data-storage">
                    <SelectValue placeholder="选择存储位置" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">本地存储</SelectItem>
                    <SelectItem value="cloud">云端存储</SelectItem>
                    <SelectItem value="both">本地+云端备份</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-backup">自动备份</Label>
                  <div className="text-sm text-muted-foreground">自动备份辩论数据</div>
                </div>
                <Switch id="auto-backup" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">备份频率</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="选择备份频率" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">实时备份</SelectItem>
                    <SelectItem value="daily">每日备份</SelectItem>
                    <SelectItem value="weekly">每周备份</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug-mode">调试模式</Label>
                  <div className="text-sm text-muted-foreground">启用详细日志记录</div>
                </div>
                <Switch id="debug-mode" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
