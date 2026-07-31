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
  Wrench
} from 'lucide-react'

interface DashboardProps {
  onNavigate: (tab: string) => void
}

interface Task {
  id: number
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  progress: number
}

interface NewsItem {
  id: number
  title: string
  country: string
  publishedAt: string
  impact: 'high' | 'medium' | 'low'
}

const recentTasks: Task[] = [
  {
    id: 1,
    title: '完成产品调研报告',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-07-31',
    progress: 65
  },
  {
    id: 2,
    title: '准备下周会议材料',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-08-01',
    progress: 0
  },
  {
    id: 3,
    title: '联系供应商确认库存',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-07-30',
    progress: 100
  },
  {
    id: 4,
    title: '分析欧洲市场趋势',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-08-02',
    progress: 30
  }
]

const latestNews: NewsItem[] = [
  {
    id: 1,
    title: '英国通胀率降至2.5%，消费者信心回升',
    country: '英国',
    publishedAt: '10分钟前',
    impact: 'high'
  },
  {
    id: 2,
    title: '德国推出新的环保法规，影响电子产品进口',
    country: '德国',
    publishedAt: '25分钟前',
    impact: 'high'
  },
  {
    id: 3,
    title: '西班牙夏季旅游旺季推动零售增长',
    country: '西班牙',
    publishedAt: '45分钟前',
    impact: 'medium'
  },
  {
    id: 4,
    title: '法国电商法修订，加强消费者权益保护',
    country: '法国',
    publishedAt: '1小时前',
    impact: 'high'
  },
  {
    id: 5,
    title: '意大利中小企业数字化转型加速',
    country: '意大利',
    publishedAt: '1.5小时前',
    impact: 'medium'
  }
]

export function Dashboard({ onNavigate }: DashboardProps) {
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
      '美国': '🇺🇸',
      '英国': '🇬🇧',
      '西班牙': '🇪🇸',
      '意大利': '🇮🇹',
      '法国': '🇫🇷',
      '德国': '🇩🇪'
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

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来！</h1>
        <p className="text-gray-600">今天是2026年7月31日，星期五</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onNavigate('tasks')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-medium ${
                            task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            截止: {task.dueDate}
                          </span>
                          <span>进度: {task.progress}%</span>
                        </div>
                        {/* 进度条 */}
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
              {latestNews.map((news) => (
                <div key={news.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onNavigate('news')}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getCountryFlag(news.country)}</span>
                        <Badge variant="outline" className="text-xs">{news.country}</Badge>
                        {getImpactBadge(news.impact)}
                      </div>
                      <h3 className="font-medium text-gray-900">{news.title}</h3>
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