import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Newspaper
} from 'lucide-react'

interface NewsItem {
  id: number
  title: string
  summary: string
  source: string
  country: string
  category: string
  impact: 'high' | 'medium' | 'low'
  ecommerceImpact: boolean
  publishedAt: string
  url: string
  trendingTopics: string[]
}

interface TrendItem {
  keyword: string
  change: number
  country: string
  category: string
}

const mockNews: NewsItem[] = [
  // 英国新闻
  {
    id: 1,
    title: '英国通胀率降至2.5%，消费者信心回升',
    summary: '英国国家统计局最新数据显示，通胀率降至2.5%，消费者信心指数上升，预计将促进零售消费增长。',
    source: 'BBC News',
    country: '英国',
    category: '经济',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 14:30',
    url: '#',
    trendingTopics: ['通货膨胀', '消费者信心', '零售业']
  },
  {
    id: 2,
    title: '英国零售商夏季促销活动提前，电商平台流量激增',
    summary: '多家英国零售商将夏季促销提前至7月，电商平台流量同比增长35%，转化率提升明显。',
    source: 'The Guardian',
    country: '英国',
    category: '电商',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 13:15',
    url: '#',
    trendingTopics: ['促销活动', '电商流量', '转化率']
  },
  {
    id: 3,
    title: '英国发布新智能家居能效标准，影响进口产品',
    summary: '英国政府发布新的智能家居产品能效标准，要求所有进口产品必须达到A级以上能效。',
    source: 'Financial Times',
    country: '英国',
    category: '政策',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 11:45',
    url: '#',
    trendingTopics: ['智能家居', '能效标准', '进口法规']
  },
  {
    id: 4,
    title: '英国消费者对环保产品需求增长40%',
    summary: '最新调查显示，英国消费者对环保产品的需求同比增长40%，愿意为可持续产品支付溢价。',
    source: 'Daily Mail',
    country: '英国',
    category: '消费',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 10:20',
    url: '#',
    trendingTopics: ['环保产品', '可持续消费', '绿色电商']
  },
  // 德国新闻
  {
    id: 5,
    title: '德国推出新的环保法规，影响电子产品进口',
    summary: '德国政府宣布新的电子产品环保标准，要求所有进口电子产品必须符合新的能效和回收标准。',
    source: 'Deutsche Welle',
    country: '德国',
    category: '政策',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 12:15',
    url: '#',
    trendingTopics: ['环保法规', '电子产品', '进口标准']
  },
  {
    id: 6,
    title: '德国电商市场第二季度增长12%，中国商品受欢迎',
    summary: '德国电商市场第二季度同比增长12%，中国商品在电子产品和家居品类中占比提升。',
    source: 'Handelsblatt',
    country: '德国',
    category: '电商',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 11:30',
    url: '#',
    trendingTopics: ['电商增长', '中国商品', '跨境贸易']
  },
  {
    id: 7,
    title: '德国消费者对智能家电需求激增',
    summary: '德国市场智能家电销量同比增长28%，特别是智能厨房电器和节能型产品需求旺盛。',
    source: 'Süddeutsche Zeitung',
    country: '德国',
    category: '消费',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 10:10',
    url: '#',
    trendingTopics: ['智能家电', '节能产品', '厨房电器']
  },
  {
    id: 8,
    title: '德国物流成本上升，电商平台调整配送策略',
    summary: '德国物流成本同比上涨15%，多家电商平台调整配送策略，推出更多自提点和定时配送服务。',
    source: 'Manager Magazin',
    country: '德国',
    category: '物流',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 09:45',
    url: '#',
    trendingTopics: ['物流成本', '配送策略', '自提服务']
  },
  // 西班牙新闻
  {
    id: 9,
    title: '西班牙夏季旅游旺季推动零售增长',
    summary: '西班牙旅游业强劲复苏，带动零售业增长15%，特别是旅游相关商品和纪念品销售火爆。',
    source: 'El País',
    country: '西班牙',
    category: '旅游',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 10:45',
    url: '#',
    trendingTopics: ['旅游业', '零售增长', '夏季消费']
  },
  {
    id: 10,
    title: '西班牙电商平台夏季大促销售额创新高',
    summary: '西班牙电商平台夏季大促期间销售额同比增长22%，移动端购物占比达到65%。',
    source: 'La Vanguardia',
    country: '西班牙',
    category: '电商',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 12:30',
    url: '#',
    trendingTopics: ['夏季促销', '移动端购物', '销售增长']
  },
  {
    id: 11,
    title: '西班牙发布新电商消费者保护条例',
    summary: '西班牙政府发布新的电商消费者保护条例，要求电商平台提供更透明的价格和退货政策。',
    source: 'El Mundo',
    country: '西班牙',
    category: '政策',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 11:20',
    url: '#',
    trendingTopics: ['消费者保护', '价格透明', '退货政策']
  },
  {
    id: 12,
    title: '西班牙户外用品需求激增，烧烤设备销量翻倍',
    summary: '西班牙夏季户外活动增多，户外用品需求激增，烧烤设备销量同比增长120%。',
    source: 'ABC',
    country: '西班牙',
    category: '消费',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 09:50',
    url: '#',
    trendingTopics: ['户外用品', '烧烤设备', '夏季消费']
  },
  // 意大利新闻
  {
    id: 13,
    title: '意大利中小企业数字化转型加速',
    summary: '意大利政府推出补贴计划，支持中小企业数字化转型，预计将增加对电商平台和数字工具的需求。',
    source: 'Corriere della Sera',
    country: '意大利',
    category: '商业',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 08:00',
    url: '#',
    trendingTopics: ['数字化转型', '中小企业', '政府补贴']
  },
  {
    id: 14,
    title: '意大利奢侈品电商销售额增长30%',
    summary: '意大利奢侈品电商销售额第二季度同比增长30%，国际买家占比达到45%。',
    source: 'Il Sole 24 Ore',
    country: '意大利',
    category: '电商',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 10:30',
    url: '#',
    trendingTopics: ['奢侈品电商', '国际销售', '品牌出海']
  },
  {
    id: 15,
    title: '意大利消费者对家居装饰产品需求上升',
    summary: '意大利市场家居装饰产品需求同比增长18%，特别是现代简约风格和可持续材料产品。',
    source: 'La Repubblica',
    country: '意大利',
    category: '消费',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 09:15',
    url: '#',
    trendingTopics: ['家居装饰', '可持续材料', '现代设计']
  },
  {
    id: 16,
    title: '意大利电商平台推出本地化支付解决方案',
    summary: '多家意大利电商平台推出本地化支付解决方案，支持分期付款和本地支付方式。',
    source: 'Corriere Comunicazioni',
    country: '意大利',
    category: '支付',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 08:45',
    url: '#',
    trendingTopics: ['本地支付', '分期付款', '支付创新']
  },
  // 法国新闻
  {
    id: 17,
    title: '法国电商法修订，加强消费者权益保护',
    summary: '法国议会通过新的电商法修订案，要求电商平台提供更多消费者保护措施，包括更严格的退货政策。',
    source: 'Le Monde',
    country: '法国',
    category: '政策',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 09:20',
    url: '#',
    trendingTopics: ['电商法', '消费者保护', '退货政策']
  },
  {
    id: 18,
    title: '法国电商平台夏季促销活动丰富多彩',
    summary: '法国电商平台推出多样化的夏季促销活动，包括限时折扣、满减优惠和会员专享活动。',
    source: 'Les Échos',
    country: '法国',
    category: '电商',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 11:45',
    url: '#',
    trendingTopics: ['夏季促销', '会员营销', '折扣活动']
  },
  {
    id: 19,
    title: '法国消费者对有机食品需求持续增长',
    summary: '法国有机食品市场持续扩大，消费者对有机食品的需求同比增长25%，电商平台成为主要销售渠道。',
    source: 'Le Figaro',
    country: '法国',
    category: '消费',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 10:10',
    url: '#',
    trendingTopics: ['有机食品', '健康消费', '电商渠道']
  },
  {
    id: 20,
    title: '法国推出数字服务税新规，影响跨境电商',
    summary: '法国推出新的数字服务税规定，跨境电商平台需要缴纳更高的税费，可能影响商品定价。',
    source: 'BFM Business',
    country: '法国',
    category: '税务',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-30 09:30',
    url: '#',
    trendingTopics: ['数字服务税', '跨境电商', '税务成本']
  },
  // 美国新闻
  {
    id: 21,
    title: '美国零售销售数据好于预期',
    summary: '美国商务部公布零售销售数据增长0.8%，好于市场预期，显示消费市场依然强劲。',
    source: 'The New York Times',
    country: '美国',
    category: '经济',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-29 22:30',
    url: '#',
    trendingTopics: ['零售销售', '消费市场', '经济数据']
  },
  {
    id: 22,
    title: '美国电商平台Prime Day销售额突破新纪录',
    summary: '亚马逊Prime Day销售额同比增长18%，创历史新高，电子产品和家居用品最受欢迎。',
    source: 'The Wall Street Journal',
    country: '美国',
    category: '电商',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-29 20:15',
    url: '#',
    trendingTopics: ['Prime Day', '销售纪录', '电子产品']
  },
  {
    id: 23,
    title: '美国消费者对智能家居产品需求旺盛',
    summary: '美国智能家居市场规模突破300亿美元，消费者对智能音箱、智能照明和安防设备需求旺盛。',
    source: 'CNBC',
    country: '美国',
    category: '科技',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-29 19:45',
    url: '#',
    trendingTopics: ['智能家居', '市场规模', '消费电子']
  },
  {
    id: 24,
    title: '美国发布新关税政策，影响中国商品进口',
    summary: '美国政府宣布新的关税政策，部分中国商品关税上调，可能影响电商平台定价策略。',
    source: 'Bloomberg',
    country: '美国',
    category: '政策',
    impact: 'high',
    ecommerceImpact: true,
    publishedAt: '2026-07-29 18:30',
    url: '#',
    trendingTopics: ['关税政策', '中美贸易', '进口成本']
  },
  {
    id: 25,
    title: '美国户外运动装备市场增长迅猛',
    summary: '美国户外运动装备市场同比增长22%，露营、徒步和骑行装备销售火爆。',
    source: 'ESPN',
    country: '美国',
    category: '运动',
    impact: 'medium',
    ecommerceImpact: true,
    publishedAt: '2026-07-29 17:20',
    url: '#',
    trendingTopics: ['户外运动', '露营装备', '运动市场']
  }
]

const mockTrends: TrendItem[] = [
  { keyword: '冬季取暖器', change: 45, country: '英国', category: '家居' },
  { keyword: '节能电器', change: 32, country: '德国', category: '家电' },
  { keyword: '户外烧烤', change: 28, country: '西班牙', category: '户外' },
  { keyword: '智能家居', change: 25, country: '法国', category: '科技' },
  { keyword: '冬季服装', change: 22, country: '意大利', category: '时尚' },
  { keyword: '圣诞装饰', change: 18, country: '美国', category: '节日' },
  { keyword: '办公家具', change: 15, country: '德国', category: '办公' },
  { keyword: '健身器材', change: 12, country: '英国', category: '运动' },
  { keyword: '环保产品', change: 38, country: '英国', category: '可持续' },
  { keyword: '智能家电', change: 30, country: '德国', category: '家电' },
  { keyword: '户外用品', change: 26, country: '西班牙', category: '户外' },
  { keyword: '有机食品', change: 20, country: '法国', category: '食品' },
  { keyword: '奢侈品电商', change: 35, country: '意大利', category: '奢侈品' },
  { keyword: 'Prime Day', change: 42, country: '美国', category: '电商' }
]

export function News() {
  const [news] = useState<NewsItem[]>(mockNews)
  const [trends] = useState<TrendItem[]>(mockTrends)
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('2026-07-30 16:00')

  const countries = ['all', '美国', '英国', '西班牙', '意大利', '法国', '德国']
  
  const filteredNews = selectedCountry === 'all' 
    ? news 
    : news.filter(item => item.country === selectedCountry)

  const refreshNews = () => {
    setIsLoading(true)
    // 模拟刷新数据
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date().toLocaleString('zh-CN'))
    }, 2000)
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">高影响</Badge>
      case 'medium':
        return <Badge variant="secondary">中影响</Badge>
      default:
        return <Badge variant="outline">低影响</Badge>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新闻聚合</h1>
          <p className="text-gray-600">汇总各国新闻及对电商的影响分析</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            最后更新: {lastUpdated}
          </span>
          <Button 
            variant="outline" 
            onClick={refreshNews}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 国家筛选 */}
      <div className="flex flex-wrap gap-2">
        {countries.map(country => (
          <Button
            key={country}
            variant={selectedCountry === country ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCountry(country)}
          >
            {country === 'all' ? '全部国家' : `${getCountryFlag(country)} ${country}`}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 新闻列表 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Newspaper className="h-5 w-5 mr-2" />
                今日新闻 ({filteredNews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNews.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getCountryFlag(item.country)}</span>
                          <Badge variant="outline">{item.country}</Badge>
                          <Badge variant="secondary">{item.category}</Badge>
                          {getImpactBadge(item.impact)}
                          {item.ecommerceImpact && (
                            <Badge className="bg-green-100 text-green-800">电商影响</Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.summary}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>来源: {item.source}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.publishedAt}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.trendingTopics.map(topic => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Google趋势 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Google趋势变动
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trend.change > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {trend.change > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{trend.keyword}</div>
                        <div className="text-xs text-gray-500">
                          {getCountryFlag(trend.country)} {trend.country} · {trend.category}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      trend.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 快速分析 */}
          <Card>
            <CardHeader>
              <CardTitle>趋势分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">关键发现</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 冬季取暖器在英国搜索量增长45%</li>
                    <li>• 节能电器在德国市场关注度上升</li>
                    <li>• 户外烧烤产品在西班牙进入旺季</li>
                    <li>• 智能家居产品在法国持续热门</li>
                    <li>• 奢侈品电商在意大利销售额增长30%</li>
                    <li>• Prime Day在美国创下销售新纪录</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">电商机会</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• 英国冬季取暖器需求即将爆发</li>
                    <li>• 德国环保法规带来合规产品机会</li>
                    <li>• 西班牙旅游季推动相关商品销售</li>
                    <li>• 意大利奢侈品电商国际销售增长</li>
                    <li>• 美国户外运动装备市场增长迅猛</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">风险提示</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• 法国电商法修订需关注合规要求</li>
                    <li>• 德国环保法规可能增加进口成本</li>
                    <li>• 美国新关税政策影响中国商品定价</li>
                    <li>• 法国数字服务税增加跨境电商成本</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}