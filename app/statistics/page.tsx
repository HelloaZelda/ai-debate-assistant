import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Download } from "lucide-react"

export default function StatisticsPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">数据统计与分析</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">总体概览</TabsTrigger>
          <TabsTrigger value="time">时间分析</TabsTrigger>
          <TabsTrigger value="content">内容分析</TabsTrigger>
          <TabsTrigger value="performance">表现评估</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">总辩论次数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">总辩论时长</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5:42:15</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">平均每场时长</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">28:31</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">总发言次数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">342</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>辩论主题分布</CardTitle>
                <CardDescription>按主题分类的辩论数量</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[主题分布图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>辩论模式对比</CardTitle>
                <CardDescription>标准模式与自由模式的使用情况</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[模式对比图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>月度辩论趋势</CardTitle>
                <CardDescription>过去6个月的辩论活动</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[月度趋势图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>辩论结果分析</CardTitle>
                <CardDescription>正反方胜率统计</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[胜率分析图表]</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">平均发言时长</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1:24</div>
                <p className="text-sm text-muted-foreground">每次发言平均时长</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">正方总发言时间</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2:51:23</div>
                <p className="text-sm text-muted-foreground">所有辩论累计</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">反方总发言时间</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2:50:52</div>
                <p className="text-sm text-muted-foreground">所有辩论累计</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>各阶段时间分配</CardTitle>
                <CardDescription>不同辩论阶段的时间占比</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[阶段时间分配图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>发言时长分布</CardTitle>
                <CardDescription>单次发言时长的分布情况</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[发言时长分布图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>超时统计</CardTitle>
                <CardDescription>各阶段超时情况分析</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[超时统计图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>时间利用效率</CardTitle>
                <CardDescription>各阶段时间利用率对比</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[时间利用效率图表]</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">总字数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">42,568</div>
                <p className="text-sm text-muted-foreground">所有辩论累计</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">平均语速</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">185</div>
                <p className="text-sm text-muted-foreground">字/分钟</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">关键词数量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">324</div>
                <p className="text-sm text-muted-foreground">高频关键词</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>热门关键词</CardTitle>
                <CardDescription>辩论中最常出现的关键词</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[关键词云图]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>论点分类</CardTitle>
                <CardDescription>辩论中使用的论点类型分布</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[论点分类图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>引用来源分析</CardTitle>
                <CardDescription>辩论中引用的数据来源分布</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[引用来源图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>情感分析</CardTitle>
                <CardDescription>辩论内容的情感倾向分析</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[情感分析图表]</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">打断次数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">47</div>
                <p className="text-sm text-muted-foreground">所有辩论累计</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">反驳成功率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">68%</div>
                <p className="text-sm text-muted-foreground">有效反驳比例</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">论点完整度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">83%</div>
                <p className="text-sm text-muted-foreground">论点结构完整性</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>辩手表现雷达图</CardTitle>
                <CardDescription>多维度评估辩手表现</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[表现雷达图]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>逻辑漏洞分析</CardTitle>
                <CardDescription>辩论中出现的逻辑问题分类</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[逻辑漏洞分析图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>表现进步趋势</CardTitle>
                <CardDescription>辩手表现随时间的变化</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[进步趋势图表]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI建议采纳率</CardTitle>
                <CardDescription>辩手采纳AI建议的比例</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">[AI建议采纳率图表]</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              导出完整分析报告
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
