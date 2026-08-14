import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCloudData } from '@/lib/useCloudData'
import { cloudLoad } from '@/lib/cloud'
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
  titleZh?: string
  summary: string
  summaryZh?: string
  source: string
  country: string
  category: string
  impact: 'high' | 'medium' | 'low'
  ecommerceImpact: boolean
  publishedAt: string
  updated?: string
  url: string
  trendingTopics: string[]
  dimension?: 'ecommerce' | 'local'
  aspects?: ('ecommerce' | 'local')[]
  relatedTrends?: { keyword: string; change: number; country: string; category: string }[]
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
  // 新闻/趋势改从 Gitee 云端读取（与事项、飞书同步同一套机制），每天由后台任务更新，无需重新部署
  const [news, setNews] = useCloudData<NewsItem[]>('news', mockNews)
  const [trends, setTrends] = useCloudData<TrendItem[]>('trends', mockTrends)
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedDimension, setSelectedDimension] = useState<'all' | 'ecommerce' | 'local'>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    if (news.length) {
      const updated = news[0]?.updated || ''
      setLastUpdated(updated || new Date().toLocaleString('zh-CN'))
    }
  }, [news])

  // 关键发现 / 电商机会 / 当地人关注 / 风险提示 由当前新闻实时派生，不再写死
  const getAspects = (item: NewsItem): ('ecommerce' | 'local')[] =>
    item.aspects && item.aspects.length
      ? item.aspects
      : [item.dimension ?? (item.ecommerceImpact ? 'ecommerce' : 'local')]
  const relTrends = (item: NewsItem) => {
    if (item.relatedTrends && item.relatedTrends.length) return item.relatedTrends
    return trends.slice().sort((a, b) => b.change - a.change).slice(0, 3)
  }
  const hasAspect = (item: NewsItem, a: 'ecommerce' | 'local') => getAspects(item).includes(a)
  const highImpactNews = news.filter(n => n.impact === 'high')
  const ecomNews = news.filter(n => hasAspect(n, 'ecommerce'))
  const localNews = news.filter(n => hasAspect(n, 'local'))
  const riskNews = news.filter(n => n.category === '政策' || n.category === '税务' || n.impact === 'high')

  const countries = ['all', '美国', '英国', '西班牙', '意大利', '法国', '德国']
  
  const filteredNews = news.filter(item => {
    const okCountry = selectedCountry === 'all' || item.country === selectedCountry
    const okDim = selectedDimension === 'all' || hasAspect(item, selectedDimension)
    return okCountry && okDim
  })

  const filteredTrends = selectedCountry === 'all'
    ? trends
    : trends.filter(t => t.country === selectedCountry)

  const refreshNews = async () => {
    setIsLoading(true)
    try {
      const r1 = await cloudLoad('news')
      if (r1.status === 'ok') setNews(r1.data as NewsItem[])
      const r2 = await cloudLoad('trends')
      if (r2.status === 'ok') setTrends(r2.data as TrendItem[])
    } finally {
      setIsLoading(false)
    }
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

  const getImpactAnalysis = (item: NewsItem): string => {
    const map: Record<string, string> = {
      '政策': '直接影响选品合规与进口成本。建议提前核查目标国认证（如 CE/UKCA/能效/环保标准），避免因不合规被下架或罚款，必要时调整供应链与申报方式。',
      '经济': '宏观消费力与汇率波动会影响客单价和利润。建议动态调整定价与促销节奏，关注汇率对冲，避免成本上升侵蚀毛利。',
      '电商': '平台流量与促销变化是选品风向标。建议快速跟进热销品类、优化 Listing 关键词与广告投放，抢占流量红利。',
      '消费': '消费偏好变化指明需求方向。建议围绕该趋势补充相关 SKU，并在详情页强化对应卖点（如环保、智能、可持续）。',
      '物流': '物流成本/时效波动影响履约体验与利润。建议多渠道分散仓配、设置合理运费模板，并提前告知时效避免差评。',
      '支付': '本地化支付覆盖能显著提升转化。建议开通该市场主流支付方式（如分期、本地钱包），降低弃单率。',
      '税务': '税费变动直接吞噬利润。建议重新核算到手价、优化定价与供应链，必要时调整选品结构。',
      '科技': '新技术品类需求上升。建议评估供应链稳定性与上架节奏，抢占早期流量与口碑。',
      '旅游': '旅游旺季带动周边消费。建议提前备货旅游/户外/纪念品类，配合节点营销。',
      '商业': '中小企业数字化带来 B 端机会。可考虑面向卖家工具/服务类商品，拓展新客群。',
      '运动': '运动健康需求上升。建议补充相关装备，并强调功能卖点（如便携、耐用、轻量）。',
    }
    return map[item.category] || '该新闻与你的选品/运营相关，建议结合所在品类评估潜在影响，并持续关注后续进展。'
  }

  const getLocalImpactAnalysis = (item: NewsItem): string => {
    const map: Record<string, string> = {
      '政策': '该政策会直接改变当地居民的日常生活与开支（税费、价格、合规要求等）。对应到需求侧，居民会更偏向合规、实用、省钱的品类，建议据此补充相关 SKU。',
      '经济': '物价/汇率波动直接影响当地居民购买力，居民更倾向高性价比、节能省钱的实用品，建议主打平价好物、节能省电类。',
      '电商': '当地电商与平台变化影响居民购物渠道与价格，建议关注居民偏好的价格带与品类，提供更有性价比的选择。',
      '消费': '居民消费偏好变化指明生活需求方向，建议围绕该趋势补充贴合当地生活的实用 SKU，并在卖点中强调便利/健康/省钱。',
      '物流': '物流时效/成本影响居民收货体验，建议选择稳定的履约方式，降低因延迟带来的差评。',
      '支付': '本地化支付覆盖提升居民下单便利性，建议开通该市场主流支付方式，降低弃单。',
      '税务': '税费变动会抬高居民到手价，建议重新核算定价，避免因涨价流失价格敏感型用户。',
      '科技': '新技术提升生活便利预期，居民对智能家居、无线充电等接受度提高，可提前布局。',
      '旅游': '旅游/出行旺季带动居民户外与便携需求，建议补充便携、出行类实用品。',
      '商业': '中小企业活跃带来就业与消费力，居民端需求随之上升，可关注实用型消费品。',
      '运动': '健康生活需求上升，居民倾向居家健身、户外运动类用品，建议补充相关品类。',
    }
    return map[item.category] || '该新闻反映当地居民生活/消费环境的变化，建议据此评估哪些实用型产品需求会上升，提前布局相关 SKU。'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新闻聚合</h1>
          <p className="text-gray-600">汇总各国新闻：对电商的影响 + 对当地人的影响，并关联产品趋势</p>
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

      {/* 维度筛选：对电商的影响 / 对当地人的影响 */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all', label: '全部维度' },
          { key: 'ecommerce', label: '📦 对电商的影响' },
          { key: 'local', label: '👥 对当地人的影响' },
        ] as const).map(d => (
          <Button
            key={d.key}
            variant={selectedDimension === d.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDimension(d.key)}
          >
            {d.label}
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
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                          <span className="text-lg">{getCountryFlag(item.country)}</span>
                          <Badge variant="outline">{item.country}</Badge>
                          <Badge variant="secondary">{item.category}</Badge>
                          {getImpactBadge(item.impact)}
                          {getAspects(item).map(a => (
                            a === 'ecommerce'
                              ? <Badge key="e" className="bg-blue-100 text-blue-800">对电商影响</Badge>
                              : <Badge key="l" className="bg-orange-100 text-orange-800">对当地人影响</Badge>
                          ))}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{item.titleZh || item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.summaryZh || item.summary}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>来源: {item.source}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.publishedAt}
                          </span>
                          <span className="text-blue-500 font-medium">点击展开详情 ↓</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="查看原文"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {expandedId === item.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {/* 两个角度：对电商的影响 + 对当地人的影响 */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">📌 对电商的影响</h4>
                          <p className="text-sm text-blue-800 leading-relaxed">{getImpactAnalysis(item)}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-orange-900 mb-1">📌 对当地人的影响</h4>
                          <p className="text-sm text-orange-800 leading-relaxed">{getLocalImpactAnalysis(item)}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-purple-900 mb-1">🔍 相关产品趋势（用户需求侧 Google 趋势）</h4>
                          <div className="flex flex-wrap gap-1">
                            {relTrends(item).map((t, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-white flex items-center gap-1">
                                {t.keyword}
                                <span className={t.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {t.change >= 0 ? '+' : ''}{t.change}%
                                </span>
                                {t.category === '用户需求' && <span className="text-pink-600">·需求</span>}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-purple-700 mt-2">
                            这些是受该新闻影响的品类/需求方向，可对照「产品分析」页查看对应商品。
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-green-900 mb-1">🔍 相关关键词</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.trendingTopics.map(topic => (
                              <Badge key={topic} variant="outline" className="text-xs bg-white">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          查看原文 / 搜索更多报道
                        </a>
                      </div>
                    )}
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
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Google趋势变动
                </span>
                <Badge variant="outline" className="text-xs">
                  {selectedCountry === 'all' ? '全部国家' : `${getCountryFlag(selectedCountry)} ${selectedCountry}`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTrends.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">该国暂无趋势数据</p>
                ) : filteredTrends.map((trend, index) => (
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
                    {highImpactNews.slice(0, 6).map(n => (
                      <li key={n.id}>• {(n.titleZh || n.title)}</li>
                    ))}
                    {highImpactNews.length === 0 && <li>• 暂无高影响新闻</li>}
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">电商机会（{ecomNews.length}）</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {ecomNews.slice(0, 6).map(n => (
                      <li key={n.id}>• {getCountryFlag(n.country)} {(n.titleZh || n.title)}</li>
                    ))}
                    {ecomNews.length === 0 && <li>• 暂无相关机会</li>}
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">当地人关注（{localNews.length}）</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    {localNews.slice(0, 6).map(n => (
                      <li key={n.id}>• {getCountryFlag(n.country)} {(n.titleZh || n.title)}</li>
                    ))}
                    {localNews.length === 0 && <li>• 暂无相关内容</li>}
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">风险提示</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {riskNews.slice(0, 6).map(n => (
                      <li key={n.id}>• {getCountryFlag(n.country)} {(n.titleZh || n.title)}</li>
                    ))}
                    {riskNews.length === 0 && <li>• 暂无相关风险</li>}
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