import { useState } from 'react'
import { useCloudData } from '@/lib/useCloudData'
import { cloudLoad } from '@/lib/cloud'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  ShoppingCart,
  Star,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Filter,
  ExternalLink,
  Flame
} from 'lucide-react'
import { ProductGlyph } from '@/components/ProductGlyph'

interface Product {
  id: number
  name: string
  nameZh?: string
  platform: string
  category: string
  price: number
  currency: string
  salesGrowth: number
  rating: number
  reviewCount: number
  monthlySales?: number
  imageUrl: string
  alibabaPrice: number
  pros: string[]
  cons: string[]
  trending: boolean
  lastUpdated: string
  stage?: 'old' | 'new'   // old=老链接起量 / new=新链接快速起量
  ali1688Url?: string     // 1688 同款货源链接
  sellUrl?: string        // 当前售卖平台链接
}

interface TrendProduct {
  platform: string
  name: string
  pros: string[]
  cons: string[]
  stage?: 'old' | 'new'   // old=老链接起量 / new=新链接快速起量
  growth?: string         // 实际增长证据（可引用）
}

const platforms: { id: string; name: string; color: string; icon: string }[] = [
  { id: 'amazon', name: 'Amazon', color: 'bg-yellow-100 text-yellow-800', icon: '📦' },
  { id: 'tiktok', name: 'TikTok Shop', color: 'bg-pink-100 text-pink-800', icon: '🎵' },
  { id: 'temu', name: 'Temu', color: 'bg-orange-100 text-orange-800', icon: '🛒' },
  { id: 'shein', name: 'SHEIN', color: 'bg-red-100 text-red-800', icon: '👗' },
  { id: 'aliexpress', name: '速卖通', color: 'bg-blue-100 text-blue-800', icon: '🌐' },
  { id: 'ebay', name: 'eBay', color: 'bg-purple-100 text-purple-800', icon: '🔨' },
  { id: 'walmart', name: 'Walmart', color: 'bg-green-100 text-green-800', icon: '🏬' },
  { id: 'independent', name: '独立站', color: 'bg-teal-100 text-teal-800', icon: '🏪' },
]

// 各平台标签 -> 实际展示的趋势来源平台（按 platform 字段 1:1 区分，互不重复）
const PLATFORM_SOURCES: Record<string, string[]> = {
  tiktok: ['tiktok'],
  temu: ['temu'],
  shein: ['shein'],
  aliexpress: ['aliexpress'],
  ebay: ['ebay'],
  walmart: ['walmart'],
  independent: ['independent'],
}

// 离线兜底：Amazon 真实商品（精简），正常情况由云端 Gitee 覆盖
const mockProducts: Product[] = [
  {
    id: 1, name: 'DREO 取暖器', nameZh: 'DREO 取暖器', platform: 'amazon', category: '家居电器',
    price: 59.99, currency: 'USD', salesGrowth: 0, rating: 4.5, reviewCount: 1234,
    monthlySales: 12000, imageUrl: '', alibabaPrice: 180,
    pros: ['冬季刚需', '使用频次高'], cons: ['体积偏大', '季节性强'],
    trending: true, lastUpdated: '2026-08-06', stage: 'new',
    ali1688Url: 'https://s.1688.com/selloffer/offer_search.htm?keywords=' + encodeURIComponent('取暖器 小型 便携式'),
    sellUrl: 'https://www.amazon.com/s?k=space+heater'
  }
]

// 离线兜底：趋势平台数据（正常情况由云端 Gitee trend_products.json 覆盖）
const mockTrend: TrendProduct[] = [
  { platform: 'tiktok', name: '落日投影灯', pros: ['氛围感拉满', '开箱即出片'], cons: ['仅氛围无实用'], stage: 'new', growth: 'TikTok 话题播放 8亿+' },
  { platform: 'temu', name: '迷你桌面吸尘器', pros: ['月销10万+', '极致性价比'], cons: ['吸力浅'], stage: 'old', growth: '峰值月销10万+' },
  { platform: 'shein', name: '真空压缩收纳袋', pros: ['换季省空间', '防潮防霉'], cons: ['需先排气'], stage: 'old', growth: '家居收纳 SHEIN 常青' },
  { platform: 'ebay', name: '复古胶片相机', pros: ['复古回潮', '收藏增值'], cons: ['胶片成本'], stage: 'new', growth: '胶片回潮 eBay +65%' },
]

export function Products() {
  const [products, setProducts] = useCloudData<Product[]>('products', mockProducts)
  const [trendProducts, setTrendProducts] = useCloudData<TrendProduct[]>('trend_products', mockTrend)
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [stageFilter, setStageFilter] = useState<'all' | 'old' | 'new'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const getStage = (p: Product): 'old' | 'new' =>
    p.stage || (p.salesGrowth >= 160 ? 'new' : 'old')

  const getTrendStage = (t: TrendProduct): 'old' | 'new' => t.stage || 'old'

  const getAliUrl = (p: Product) =>
    p.ali1688Url ||
    `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(p.name)}`

  const getSellUrl = (p: Product) =>
    p.sellUrl || `https://www.amazon.com/s?k=${encodeURIComponent(p.name)}`

  const showAmazon = selectedPlatform === 'all' || selectedPlatform === 'amazon'
  const showTrend = selectedPlatform === 'all' || (PLATFORM_SOURCES[selectedPlatform] || []).length > 0

  const amazonFiltered = products.filter(product => {
    if (product.platform !== 'amazon') return false
    const name = (product.nameZh || product.name).toLowerCase()
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = stageFilter === 'all' || getStage(product) === stageFilter
    return matchesSearch && matchesStage
  })

  // Amazon 数据最新刷新日期（取所有 amazon 商品里最大的 lastUpdated）
  const amazonUpdateDate = (() => {
    const ds = products.filter(p => p.platform === 'amazon' && p.lastUpdated).map(p => p.lastUpdated as string)
    return ds.length ? ds.sort().reverse()[0] : '—'
  })()

  const trendListFor = (pid: string): TrendProduct[] => {
    const sources = PLATFORM_SOURCES[pid] || []
    let list: TrendProduct[] = []
    for (const s of sources) list = list.concat(trendProducts.filter(t => t.platform === s))
    if (stageFilter !== 'all') list = list.filter(t => getTrendStage(t) === stageFilter)
    return list
  }

  const trendCountFor = (pid: string) => trendListFor(pid).length

  const refreshProducts = async () => {
    setIsLoading(true)
    try {
      const r = await cloudLoad('products')
      if (r.status === 'ok') setProducts(r.data as Product[])
      const r2 = await cloudLoad('trend_products')
      if (r2.status === 'ok') setTrendProducts(r2.data as TrendProduct[])
    } finally {
      setIsLoading(false)
    }
  }

  const getPlatformBadge = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform ? (
      <Badge className={platform.color}>
        {platform.icon} {platform.name}
      </Badge>
    ) : null
  }

  const displayName = (p: Product) => p.nameZh || p.name

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">产品分析</h1>
          <p className="text-gray-600">Amazon 真实在售商品 · 其他平台快速增值爆款（名称+好评/差评点）</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshProducts} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 平台筛选 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedPlatform === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPlatform('all')}
        >
          全部 ({products.filter(p => p.platform === 'amazon').length + trendProducts.length})
        </Button>
        {platforms.map(platform => {
          const count = platform.id === 'amazon'
            ? products.filter(p => p.platform === 'amazon').length
            : trendCountFor(platform.id)
          return (
            <Button
              key={platform.id}
              variant={selectedPlatform === platform.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPlatform(platform.id)}
            >
              {platform.icon} {platform.name} ({count})
            </Button>
          )
        })}
      </div>

      {/* 起量阶段筛选（Amazon + 趋势平台通用） */}
      {(() => {
        const trendAll = (['tiktok', 'temu', 'shein', 'aliexpress', 'ebay', 'walmart', 'independent'] as const).flatMap(p => trendListFor(p))
        const allCount = amazonFiltered.length + trendAll.length
        const newCount = amazonFiltered.filter(p => getStage(p) === 'new').length + trendAll.filter(t => getTrendStage(t) === 'new').length
        const oldCount = amazonFiltered.filter(p => getStage(p) === 'old').length + trendAll.filter(t => getTrendStage(t) === 'old').length
        return (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500 mr-1">起量阶段:</span>
            <Button variant={stageFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStageFilter('all')}>
              全部 ({allCount})
            </Button>
            <Button variant={stageFilter === 'old' ? 'default' : 'outline'} size="sm" onClick={() => setStageFilter('old')}>
              老链接起量 ({oldCount})
            </Button>
            <Button variant={stageFilter === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setStageFilter('new')}>
              新链接快速起量 ({newCount})
            </Button>
          </div>
        )
      })()}

      {/* 搜索 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索产品名称或类别..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          高级筛选
        </Button>
      </div>

      {/* Amazon 统计 */}
      {showAmazon && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{products.filter(p => p.platform === 'amazon').length}</div>
                <div className="text-sm text-gray-600">Amazon 商品数</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {amazonFiltered.filter(p => (p.monthlySales || 0) >= 10000).length}
                </div>
                <div className="text-sm text-gray-600">月销过万</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {amazonFiltered.filter(p => getStage(p) === 'new').length}
                </div>
                <div className="text-sm text-gray-600">新链接快速起量</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {amazonFiltered.filter(p => getStage(p) === 'old').length}
                </div>
                <div className="text-sm text-gray-600">老链接起量</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Amazon 数据更新日期 + 说明 */}
      {showAmazon && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
          <span>
            Amazon 畅销榜数据更新于 <b className="text-gray-700">{amazonUpdateDate}</b>，每日 07:30 自动刷新。
            畅销榜头部（DREO 取暖器、BISSELL 清洁机等）变化较慢，属周/月级轮换，并非每日换新——这是数据源特性，非更新失效。
          </span>
        </div>
      )}

      {/* 趋势平台提示（单个非 Amazon 平台时） */}
      {!showAmazon && (
        <Card>
          <CardContent className="p-4 text-sm text-gray-600">
            <p>
              <Flame className="h-4 w-4 inline mr-1 text-orange-500" />
              当前展示 <b>{platforms.find(p => p.id === selectedPlatform)?.name}</b> 快速增值爆款 {trendCountFor(selectedPlatform)} 个（基于公开趋势整理，非实时 API）。
            </p>
            <p className="mt-1 text-xs text-gray-500">如需逐条真实商品（图+链接），请从对应平台后台导出 CSV 给工作台接入。</p>
          </CardContent>
        </Card>
      )}

      {/* ============ Amazon 真实商品（带图） ============ */}
      {showAmazon && (
        <>
          {selectedPlatform === 'all' && (
            <h2 className="text-lg font-semibold text-gray-800 mt-2">📦 Amazon 真实在售（带图 + 真实商品页）</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amazonFiltered.map(product => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <ProductGlyph name={product.name} imageUrl={product.imageUrl} className="w-full h-full" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-2">{displayName(product)}</h3>
                        <p className="text-xs text-gray-400 line-clamp-1">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getStage(product) === 'new' ? (
                        <Badge className="bg-pink-100 text-pink-700">新链接快速起量</Badge>
                      ) : (
                        <Badge className="bg-indigo-100 text-indigo-700">老链接起量</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {product.currency} {product.price}
                        </div>
                        <div className="text-sm text-gray-500">1688同款: ¥{product.alibabaPrice}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">月销量</div>
                        <div className="text-base font-semibold text-gray-900">
                          {product.monthlySales ? `${product.monthlySales.toLocaleString()} /月` : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {getPlatformBadge(product.platform)}
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-green-600">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        <span className="font-medium">好评点:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.pros.slice(0, 3).map((pro, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50">
                            {pro}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-red-600 mt-2">
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        <span className="font-medium">差评点:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.cons.slice(0, 3).map((con, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-red-50">
                            {con}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" asChild>
                        <a href={getAliUrl(product)} target="_blank" rel="noopener noreferrer">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          1688同款
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={getSellUrl(product)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          查看售卖
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                        <BarChart3 className="h-4 w-4 mr-1" />
                        详情
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {amazonFiltered.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到产品</h3>
              <p className="text-gray-600">尝试调整筛选条件或搜索词</p>
            </div>
          )}
        </>
      )}

      {/* ============ 其他平台：快速增值爆款（仅名称 + 好评/差评点，无图无链接） ============ */}
      {showTrend && (
        <>
          {selectedPlatform === 'all' && (
            <h2 className="text-lg font-semibold text-gray-800 mt-2">🔥 其他平台快速增值爆款（名称 + 阶段 + 实际增长 + 好评/差评点）</h2>
          )}
          {selectedPlatform === 'all'
            ? (['tiktok', 'temu', 'shein', 'aliexpress', 'ebay', 'walmart', 'independent'] as const).map(plat => {
                const items = trendListFor(plat)
                if (!items.length) return null
                return (
                  <div key={plat} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getPlatformBadge(plat)}
                      <span className="text-sm text-gray-500">{items.length} 个快速增值</span>
                    </div>
                    {plat === 'independent' && (
                      <p className="text-xs text-gray-500">独立站 / DTC：Shopify 等品牌站快速增量爆款（社媒广告引爆，非平台货架）。</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((t, i) => (
                        <TrendCard key={i} item={t} />
                      ))}
                    </div>
                  </div>
                )
              })
            : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendListFor(selectedPlatform).map((t, i) => (
                    <TrendCard key={i} item={t} />
                  ))}
                </div>
              )}
        </>
      )}

      {/* 数据来源说明 */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">数据来源说明:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map(platform => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <span>{platform.icon}</span>
                  <span>{platform.name}</span>
                </div>
              ))}
            </div>
              <p className="mt-2 text-xs text-gray-500">
              • Amazon：真实亚马逊美国站 best-seller（asinsight 每日 07:30 自动抓取，含真实主图/商品页/月销）。<br />
              • TikTok Shop / Temu / SHEIN / 速卖通 / eBay / Walmart / 独立站：基于 2026 公开增长数据/趋势报告整理的真实选品信号，每条标注【实际增长】证据，非凭空词汇；非实时 API。<br />
              • 各平台标签 1:1 区分、互不重复：每个标签只展示该平台自身的趋势爆款（不再复用其他平台数据）。<br />
              • 本页【不展示服装与美妆】：SHEIN 标签仅保留家居/电子/配件/宠物等非服装类目，已剔除 SHEIN 服装及 TikTok 美妆个护类目。<br />
              • 阶段标注：新链接快速起量=近 1-6 个月新上架/新病毒款短期爆发；老链接起量=常青/已存在商品近期重新加速增长。<br />
              • 若要逐条真实商品（图+链接），请从对应平台后台导出 CSV 给工作台接入。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Amazon 详情弹窗 */}
      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ProductGlyph name={selectedProduct.name} imageUrl={selectedProduct.imageUrl} className="w-10 h-10 shrink-0" />
                  {displayName(selectedProduct)}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap">
                  {getPlatformBadge(selectedProduct.platform)}
                  <span>· {selectedProduct.category}</span>
                  {getStage(selectedProduct) === 'new' ? (
                    <Badge className="bg-pink-100 text-pink-700">新链接快速起量</Badge>
                  ) : (
                    <Badge className="bg-indigo-100 text-indigo-700">老链接起量</Badge>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <ProductGlyph name={selectedProduct.name} imageUrl={selectedProduct.imageUrl} className="w-full h-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500">售价</div>
                  <div className="text-lg font-semibold">{selectedProduct.currency} {selectedProduct.price}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500">1688同款</div>
                  <div className="text-lg font-semibold">¥{selectedProduct.alibabaPrice}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-gray-500">月销量</div>
                  <div className="text-lg font-semibold text-green-600">{selectedProduct.monthlySales ? selectedProduct.monthlySales.toLocaleString() + ' /月' : '—'}</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-gray-500">评分</div>
                  <div className="text-lg font-semibold text-yellow-600">⭐ {selectedProduct.rating} ({selectedProduct.reviewCount})</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center"><ThumbsUp className="h-4 w-4 mr-1" />好评点</h4>
                  <ul className="space-y-1">
                    {selectedProduct.pros.map((p, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-1"><span className="text-green-500">✓</span>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center"><ThumbsDown className="h-4 w-4 mr-1" />差评点</h4>
                  <ul className="space-y-1">
                    {selectedProduct.cons.map((c, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-1"><span className="text-red-500">✗</span>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={getAliUrl(selectedProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  1688 同款货源
                </a>
                <a
                  href={getSellUrl(selectedProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  查看当前售卖链接
                </a>
              </div>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedProduct.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                在 Google 搜索该产品图片/评测
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TrendCard({ item }: { item: TrendProduct }) {
  const isNew = item.stage !== 'old'
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 leading-snug">{item.name}</h3>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {isNew ? (
              <Badge className="bg-pink-100 text-pink-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                新链接快速起量
              </Badge>
            ) : (
              <Badge className="bg-indigo-100 text-indigo-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                老链接起量
              </Badge>
            )}
          </div>
        </div>
        {item.growth && (
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span><b>实际增长：</b>{item.growth}</span>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-green-600">
            <ThumbsUp className="h-4 w-4 mr-2 shrink-0" />
            <span className="font-medium">好评点</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.pros.map((pro, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-green-50 border-green-200">
                {pro}
              </Badge>
            ))}
          </div>
          <div className="flex items-center text-sm text-red-600 mt-2">
            <ThumbsDown className="h-4 w-4 mr-2 shrink-0" />
            <span className="font-medium">差评点</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.cons.map((con, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-red-50 border-red-200">
                {con}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
