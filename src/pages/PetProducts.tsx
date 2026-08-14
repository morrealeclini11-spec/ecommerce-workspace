import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PawPrint, TrendingUp, Globe2, ThumbsUp, ThumbsDown, Package } from 'lucide-react'
import { useCloudData } from '@/lib/useCloudData'

interface PetProduct {
  id: number
  platform: string
  name: string
  nameZh: string
  price: string
  salesGrowth: string
  stage: string
  pros: string[]
  cons: string[]
  lastUpdated: string
}

interface RegionInfo {
  demand: string
  review: string
  topNeeds: string[]
}

interface PetMixRegion {
  householdRate: string
  mainstream: Record<string, string>
  niche: Record<string, string>
  note: string
}

interface PetInsights {
  updated: string
  market: Record<string, string>
  regions: Record<string, RegionInfo>
  tiktokTier: string
  petMix: {
    summary: string
    regions: Record<string, PetMixRegion>
  }
  demands: string[]
  source?: string
}

const PLATFORMS = [
  { id: 'all', name: '全部' },
  { id: 'tiktok', name: 'TikTok Shop（主）' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'shopee', name: 'Shopee' },
  { id: 'temu', name: 'Temu' },
]

const PLATFORM_ORDER = ['tiktok', 'amazon', 'shopee', 'temu']

const PLATFORM_COLOR: Record<string, string> = {
  amazon: 'bg-orange-100 text-orange-700',
  tiktok: 'bg-cyan-100 text-cyan-700',
  shopee: 'bg-red-100 text-red-700',
  temu: 'bg-yellow-100 text-yellow-700',
}

const fallbackInsights: PetInsights = {
  updated: '2026-08-10',
  market: {},
  regions: {},
  tiktokTier: '',
  petMix: { summary: '', regions: {} },
  demands: [],
}
const fallbackProducts: PetProduct[] = []

export function PetProducts() {
  const [insights] = useCloudData<PetInsights>('pet_insights', fallbackInsights)
  const [products] = useCloudData<PetProduct[]>('pet_products', fallbackProducts)
  const [platform, setPlatform] = useState('tiktok')

  const filtered = platform === 'all'
    ? [...products].sort((a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform))
    : products.filter((p) => p.platform === platform)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <PawPrint className="h-6 w-6 mr-2 text-pink-500" />
            宠物产品分析
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            数据更新于 {insights.updated || '—'} · 基于 2026 公开趋势调研整理，每日刷新
          </p>
        </div>
      </div>

      {/* 市场规模 */}
      {insights.market && Object.keys(insights.market).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Globe2 className="h-5 w-5 mr-2 text-blue-500" /> 全球宠物市场规模（2026）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(insights.market).map(([k, v]) => (
                <div key={k} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">
                    {k === 'global' ? '全球' : k === 'us' ? '美国' : k === 'europe' ? '欧洲' : k === 'uk' ? '英国' : k === 'mx' ? '墨西哥' : '线上'}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{v}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 英美欧墨需求与评价 */}
      {insights.regions && Object.keys(insights.regions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" /> 英美欧墨需求与评价
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(insights.regions).map(([k, r]) => (
                <div key={k} className="p-4 border rounded-lg">
                  <div className="font-semibold text-gray-900 mb-2">
                    {k === 'us' ? '🇺🇸 美国' : k === 'uk' ? '🇬🇧 英国' : k === 'eu' ? '🇪🇺 欧洲' : '🇲🇽 墨西哥'}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium text-gray-900">需求：</span>{r.demand}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium text-gray-900">评价：</span>{r.review}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.topNeeds.map((n, i) => (
                      <Badge key={i} variant="secondary" className="text-[11px]">{n}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TikTok 消费档位 */}
      {insights.tiktokTier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <PawPrint className="h-5 w-5 mr-2 text-cyan-500" /> TikTok Shop 宠物消费档位
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{insights.tiktokTier}</p>
          </CardContent>
        </Card>
      )}

      {/* 大众 / 小众宠物比例（美/英/欧/墨） */}
      {insights.petMix && insights.petMix.regions && Object.keys(insights.petMix.regions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Package className="h-5 w-5 mr-2 text-purple-500" /> 大众 / 小众宠物占比（美 / 英 / 欧 / 墨）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(insights.petMix.regions).map(([k, r]) => (
                <div key={k} className="p-4 border rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">
                    {k === 'us' ? '🇺🇸 美国' : k === 'uk' ? '🇬🇧 英国' : k === 'eu' ? '🇪🇺 欧洲' : '🇲🇽 墨西哥'}
                    <span className="font-normal text-gray-500 text-xs ml-2">{r.householdRate}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-xs font-medium text-blue-700 mb-1">主流（狗+猫）</div>
                      <div className="space-y-1">
                        {Object.entries(r.mainstream).map(([kk, v]) => (
                          <div key={kk} className="text-xs text-gray-700 p-1.5 bg-blue-50 rounded">{v}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-purple-700 mb-1">小众宠物</div>
                      <div className="space-y-1">
                        {Object.entries(r.niche).map(([kk, v]) => (
                          <div key={kk} className="text-xs text-gray-700 p-1.5 bg-purple-50 rounded">{v}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.note && <p className="text-[11px] text-gray-500 mt-2">{r.note}</p>}
                </div>
              ))}
            </div>
            {insights.petMix.summary && (
              <p className="text-xs text-gray-500 mt-3">{insights.petMix.summary}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 当前主要需求 */}
      {insights.demands && insights.demands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <ThumbsUp className="h-5 w-5 mr-2 text-green-600" /> 当前主要需求方向
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.demands.map((d, i) => (
                <Badge key={i} className="bg-green-100 text-green-700">{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 四平台增量产品 */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center text-base">
              <TrendingUp className="h-5 w-5 mr-2 text-pink-500" /> 平台宠物增量产品（每日更新 · TikTok 为主）
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  platform === p.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">暂无数据</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{p.nameZh}</div>
                      <div className="text-xs text-gray-400 truncate">{p.name}</div>
                    </div>
                    <Badge className={`shrink-0 text-[10px] ${PLATFORM_COLOR[p.platform] || 'bg-gray-100 text-gray-600'}`}>
                      {p.platform.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <span className="font-medium text-gray-900">{p.price}</span>
                    <span className="text-green-600 font-medium">{p.salesGrowth}</span>
                    <Badge variant="outline" className={`text-[10px] ${p.stage === 'new' ? 'border-pink-300 text-pink-600' : 'border-indigo-300 text-indigo-600'}`}>
                      {p.stage === 'new' ? '新晋增量' : '成熟增量'}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <ThumbsUp className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {p.pros.map((x, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-green-200 text-green-700">{x}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ThumbsDown className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {p.cons.map((x, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-red-200 text-red-600">{x}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">
            说明：产品为各平台 2026 公开爆款/增量趋势整理（Amazon/TikTok/Shopee/Temu 反爬无法免费实时抓取），每日刷新日期，跟随趋势文章迭代。优缺点基于消费者真实评价（VOC）归纳。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
