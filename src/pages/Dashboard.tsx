import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Clock,
  Calendar,
  ArrowRight,
  Newspaper,
  ShoppingCart,
  Wrench,
  TrendingUp,
  Boxes,
  Video,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react'
import { getLocalTasks } from '@/lib/tasks'
import type { Task } from '@/lib/tasks'
import { useCloudData } from '@/lib/useCloudData'

interface DashboardProps {
  onNavigate: (tab: string) => void
}

interface NewsItem {
  id: number
  title: string
  titleZh?: string
  country: string
  publishedAt: string
  impact: string
  dimension?: 'ecommerce' | 'local'
}

interface TrendItem {
  keyword: string
  change: number
  country: string
  category: string
  updated?: string
}

interface InventoryProduct {
  id: string; sku: string; name: string; category: string; owner: string
  location: string; unit: string; initial_stock: number; low_threshold: number | null
  image_url: string; created_at: string
}
interface InventoryTxn {
  id: string; product_id: string; type: 'IN' | 'OUT'; quantity: number
  occur_at: string; operator: string; note: string; created_at: string
}
interface VideoPlanItem {
  id: string; date: string; session: 'AM' | 'PM'; country: string; owner: string
  product: string; planned_count: number; planned_time: string; status: 'planned' | 'posted' | 'skipped'
  posted_count: number; note: string; created_at: string
}

const fallbackNews: NewsItem[] = [
  { id: 1, title: '英国通胀率降至2.5%，消费者信心回升', country: '英国', publishedAt: '10分钟前', impact: 'high' },
  { id: 2, title: '德国推出新的环保法规，影响电子产品进口', country: '德国', publishedAt: '25分钟前', impact: 'high' },
  { id: 3, title: '西班牙夏季旅游旺季推动零售增长', country: '西班牙', publishedAt: '45分钟前', impact: 'medium' },
  { id: 4, title: '法国电商法修订，加强消费者权益保护', country: '法国', publishedAt: '1小时前', impact: 'high' },
  { id: 5, title: '意大利中小企业数字化转型加速', country: '意大利', publishedAt: '1.5小时前', impact: 'medium' },
]

export function Dashboard({ onNavigate }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  // 新闻 / 趋势 改从 Gitee 云端读取（与产品页同一套机制），每天由后台任务更新，无需重新部署
  const [news] = useCloudData<NewsItem[]>('news', fallbackNews)
  const [trends] = useCloudData<TrendItem[]>('trends', [])
  // 库存数据来自 ec_inv_*（与 Inventory.tsx 同 key），首页只读
  const [invProducts] = useCloudData<InventoryProduct[]>('ec_inv_products_v1', [])
  const [invTxns] = useCloudData<InventoryTxn[]>('ec_inv_txns_v1', [])
  // 视频规划数据
  const [videoPlans] = useCloudData<VideoPlanItem[]>('ec_video_plan_v1', [])

  useEffect(() => {
    setTasks(getLocalTasks())
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-400" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">高</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs">中</Badge>
      default:
        return <Badge variant="outline" className="text-xs">低</Badge>
    }
  }

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      美国: '🇺🇸', 英国: '🇬🇧', 西班牙: '🇪🇸', 意大利: '🇮🇹', 法国: '🇫🇷', 德国: '🇩🇪',
    }
    return flags[country] || '🌍'
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">高影响</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs">中影响</Badge>
      default:
        return <Badge variant="outline" className="text-xs">低影响</Badge>
    }
  }

  const recentTasks = tasks.slice(0, 5)

  // 库存汇总（首页）
  const invSummary = useMemo(() => {
    const td = new Date(); td.setHours(0, 0, 0, 0)
    const tomorrow = new Date(td.getTime() + 86400000)
    let inToday = 0, outToday = 0
    invTxns.forEach(t => {
      const d = new Date(t.occur_at)
      if (d >= td && d < tomorrow) {
        if (t.type === 'IN') inToday += Number(t.quantity) || 0
        else outToday += Number(t.quantity) || 0
      }
    })
    const owners = new Set(invProducts.map(p => (p.owner || '').trim()).filter(Boolean))
    const recent = [...invTxns].sort((a, b) => new Date(b.occur_at).getTime() - new Date(a.occur_at).getTime()).slice(0, 4)
    return {
      productCount: invProducts.length,
      ownerCount: owners.size,
      inToday, outToday,
      recent: recent.map(t => ({ ...t, name: invProducts.find(p => p.id === t.product_id)?.name || '已删除商品' })),
    }
  }, [invProducts, invTxns])

  // 视频规划汇总（首页）
  const videoSummary = useMemo(() => {
    const td = new Date().toISOString().slice(0, 10)
    const todayItems = videoPlans.filter(p => p.date === td)
    const planned = todayItems.reduce((s, p) => s + Number(p.planned_count || 0), 0)
    const posted = todayItems.reduce((s, p) => s + Number(p.posted_count || 0), 0)
    return { planned, posted, left: planned - posted, itemCount: todayItems.length, todayItems }
  }, [videoPlans])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来！</h1>
        <p className="text-gray-600">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 事项安排 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              事项安排
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('tasks')}>
              查看全部 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">暂无任务，点击下方"新建任务"添加。</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('tasks')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3
                              className={`font-medium ${
                                task.status === 'completed'
                                  ? 'text-gray-500 line-through'
                                  : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </h3>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              创建: {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            <span>进度: {task.progress}%</span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 新闻摘要 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Newspaper className="h-5 w-5 mr-2" />
              今日新闻
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('news')}>
              查看全部 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {news.slice(0, 5).map((news) => (
                <div
                  key={news.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onNavigate('news')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getCountryFlag(news.country)}</span>
                        <Badge variant="outline" className="text-xs">{news.country}</Badge>
                        {getImpactBadge(news.impact)}
                        {news.dimension === 'local' && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">当地人</Badge>
                        )}
                        {news.dimension === 'ecommerce' && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">电商</Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900">{news.titleZh || news.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {news.publishedAt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Google 趋势 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Google趋势
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('news')}>
              查看全部 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {trends.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">暂无趋势数据</p>
            ) : (() => {
              const products = trends.filter(t => t.category === '产品趋势')
              const demands = trends.filter(t => t.category === '用户需求')
              const trendDate = trends.map(t => t.updated || '').filter(Boolean).sort().slice(-1)[0]
              const renderRow = (t: TrendItem, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-base shrink-0">{getCountryFlag(t.country)}</span>
                    <span className="font-medium text-gray-900 text-sm truncate">{t.keyword}</span>
                    {t.category === '用户需求'
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 shrink-0">需求</span>
                      : <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">产品</span>}
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ml-2 ${t.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {t.change >= 0 ? '+' : ''}{t.change}%
                  </span>
                </div>
              )
              return (
                <div className="space-y-3">
                  {trendDate && (
                    <p className="text-[11px] text-gray-400">数据更新于 {trendDate}</p>
                  )}
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-blue-600 mb-1">
                      <TrendingUp className="h-3 w-3" /> 产品趋势（当前热卖 / 上升产品）
                    </div>
                    <div className="space-y-2">
                      {products.slice(0, 5).map((t, i) => renderRow(t, i))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-pink-600 mb-1">
                      <TrendingUp className="h-3 w-3" /> 用户需求（消费者想要 / 需要的方向）
                    </div>
                    <div className="space-y-2">
                      {demands.slice(0, 5).map((t, i) => renderRow(t, i))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* 我的库存 + 今日视频计划 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 我的库存 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Boxes className="h-5 w-5 mr-2" />
              我的库存
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('inventory')}>
              查看全部 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500">商品种类</div>
                <div className="text-xl font-bold text-gray-900">{invSummary.productCount}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">主体数</div>
                <div className="text-xl font-bold text-blue-600">{invSummary.ownerCount}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">今日入库</div>
                <div className="text-xl font-bold text-green-600">+{invSummary.inToday}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">今日出库</div>
                <div className="text-xl font-bold text-red-600">-{invSummary.outToday}</div>
              </div>
            </div>
            {invSummary.recent.length === 0 ? (
              <p className="text-gray-500 text-sm py-3">暂无库存流水，去「电商实时库存」新增第一件商品。</p>
            ) : (
              <div className="space-y-2">
                {invSummary.recent.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm py-1.5 border-b border-dashed last:border-b-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {t.type === 'IN' ? <ArrowUpCircle className="h-4 w-4 text-green-500 shrink-0" /> : <ArrowDownCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      <span className="truncate">{t.name}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(t.occur_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className={`font-semibold shrink-0 ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'IN' ? '+' : '-'}{Number(t.quantity || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 今日视频计划 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              今日视频计划
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('video')}>
              查看全部 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500">计划发布</div>
                <div className="text-xl font-bold text-blue-600">{videoSummary.planned} 条</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">已发</div>
                <div className="text-xl font-bold text-green-600">{videoSummary.posted} 条</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">{videoSummary.left > 0 ? '还差' : '完成'}</div>
                <div className={`text-xl font-bold ${videoSummary.left > 0 ? 'text-orange-600' : 'text-green-600'}`}>{videoSummary.left > 0 ? videoSummary.left : '✓'}</div>
              </div>
            </div>
            {videoSummary.todayItems.length === 0 ? (
              <p className="text-gray-500 text-sm py-3">今日还没有视频规划，去「视频规划」新建一条。</p>
            ) : (
              <div className="space-y-2">
                {videoSummary.todayItems.slice(0, 5).map(p => {
                  const done = p.posted_count >= p.planned_count
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-dashed last:border-b-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant="outline" className={p.session === 'AM' ? 'text-amber-700 bg-amber-50' : 'text-indigo-700 bg-indigo-50'}>{p.session === 'AM' ? '上午' : '下午'}</Badge>
                        <span className="truncate">{p.product || '(未指定产品)'}</span>
                        {p.country && <span className="text-xs text-gray-400 whitespace-nowrap">· {p.country}</span>}
                      </div>
                      <span className={`font-semibold shrink-0 ${done ? 'text-green-600' : 'text-blue-600'}`}>{p.posted_count}/{p.planned_count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => onNavigate('tasks')}>
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>新建任务</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => onNavigate('news')}>
              <Newspaper className="h-6 w-6 mb-2" />
              <span>查看新闻</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => onNavigate('products')}>
              <ShoppingCart className="h-6 w-6 mb-2" />
              <span>产品分析</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => onNavigate('tools')}>
              <Wrench className="h-6 w-6 mb-2" />
              <span>工具网站</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
