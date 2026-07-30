import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  ShoppingCart,
  Star,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  BarChart3,
  Filter
} from 'lucide-react'

interface Product {
  id: number
  name: string
  platform: string
  category: string
  price: number
  currency: string
  salesGrowth: number
  rating: number
  reviewCount: number
  imageUrl: string
  alibabaPrice: number
  pros: string[]
  cons: string[]
  trending: boolean
  lastUpdated: string
}

interface Platform {
  id: string
  name: string
  color: string
  icon: string
}

const platforms: Platform[] = [
  { id: 'fastmoss', name: 'FastMoss', color: 'bg-red-100 text-red-800', icon: '🔥' },
  { id: 'jimudata', name: '极目数据', color: 'bg-blue-100 text-blue-800', icon: '📊' },
  { id: 'thunt', name: 'Thunt', color: 'bg-green-100 text-green-800', icon: '🎯' },
  { id: 'sellersprite', name: '卖家精灵', color: 'bg-purple-100 text-purple-800', icon: '🧩' }
]

const mockProducts: Product[] = [
  // FastMoss平台产品
  {
    id: 1,
    name: '便携式电暖器 USB充电',
    platform: 'fastmoss',
    category: '家居电器',
    price: 29.99,
    currency: 'USD',
    salesGrowth: 156,
    rating: 4.5,
    reviewCount: 1234,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 45,
    pros: ['便携设计', 'USB充电', '快速升温', '安全认证'],
    cons: ['功率较小', '适用面积有限'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 2,
    name: '智能保温杯 温度显示',
    platform: 'fastmoss',
    category: '生活用品',
    price: 24.99,
    currency: 'USD',
    salesGrowth: 132,
    rating: 4.6,
    reviewCount: 987,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 38,
    pros: ['智能温度显示', '保温效果好', '材质安全', '设计时尚'],
    cons: ['价格偏高', '电池续航一般'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 3,
    name: '多功能厨房料理机',
    platform: 'fastmoss',
    category: '厨房电器',
    price: 59.99,
    currency: 'USD',
    salesGrowth: 98,
    rating: 4.4,
    reviewCount: 654,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 85,
    pros: ['多功能合一', '操作简单', '清洗方便', '功率强劲'],
    cons: ['体积较大', '噪音偏高'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 4,
    name: 'LED护眼台灯 触控调光',
    platform: 'fastmoss',
    category: '家居照明',
    price: 34.99,
    currency: 'USD',
    salesGrowth: 87,
    rating: 4.7,
    reviewCount: 1567,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 52,
    pros: ['护眼设计', '触控调光', '节能环保', '多档调节'],
    cons: ['底座较轻', '电线较短'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 5,
    name: '车载手机支架 磁吸式',
    platform: 'fastmoss',
    category: '汽车用品',
    price: 19.99,
    currency: 'USD',
    salesGrowth: 112,
    rating: 4.3,
    reviewCount: 2345,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 28,
    pros: ['磁吸设计', '安装简单', '稳固不晃', '兼容性强'],
    cons: ['需要金属片', '强磁可能影响信号'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 6,
    name: '便携式榨汁杯 充电款',
    platform: 'fastmoss',
    category: '厨房电器',
    price: 27.99,
    currency: 'USD',
    salesGrowth: 145,
    rating: 4.5,
    reviewCount: 876,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 42,
    pros: ['便携设计', 'USB充电', '清洗方便', '榨汁细腻'],
    cons: ['容量较小', '电池续航一般'],
    trending: true,
    lastUpdated: '2026-07-30'
  },

  // 极目数据平台产品
  {
    id: 7,
    name: '智能温控器 节能版',
    platform: 'jimudata',
    category: '智能家居',
    price: 49.99,
    currency: 'USD',
    salesGrowth: 89,
    rating: 4.3,
    reviewCount: 856,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 68,
    pros: ['智能控制', '节能模式', '兼容性强', '安装简单'],
    cons: ['需要WiFi', '设置复杂'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 8,
    name: '智能门锁 指纹识别',
    platform: 'jimudata',
    category: '智能家居',
    price: 89.99,
    currency: 'USD',
    salesGrowth: 76,
    rating: 4.6,
    reviewCount: 543,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 125,
    pros: ['指纹识别', '密码开锁', '安全系数高', '安装方便'],
    cons: ['价格偏高', '需要电池'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 9,
    name: '智能窗帘电机 遥控款',
    platform: 'jimudata',
    category: '智能家居',
    price: 69.99,
    currency: 'USD',
    salesGrowth: 68,
    rating: 4.4,
    reviewCount: 321,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 95,
    pros: ['遥控操作', '静音设计', '定时功能', '安装简单'],
    cons: ['需要轨道', '承重有限'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 10,
    name: '智能空气净化器 PM2.5检测',
    platform: 'jimudata',
    category: '环境电器',
    price: 129.99,
    currency: 'USD',
    salesGrowth: 92,
    rating: 4.5,
    reviewCount: 432,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 185,
    pros: ['PM2.5检测', '多层滤网', '静音模式', '智能控制'],
    cons: ['价格较高', '滤网需要定期更换'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 11,
    name: '智能插座 WiFi款',
    platform: 'jimudata',
    category: '智能家居',
    price: 19.99,
    currency: 'USD',
    salesGrowth: 105,
    rating: 4.2,
    reviewCount: 1876,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 28,
    pros: ['WiFi控制', '定时开关', '远程操控', '安装简单'],
    cons: ['需要WiFi', '功率有限'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 12,
    name: '智能体重秤 体脂测量',
    platform: 'jimudata',
    category: '健康设备',
    price: 39.99,
    currency: 'USD',
    salesGrowth: 78,
    rating: 4.4,
    reviewCount: 654,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 55,
    pros: ['体脂测量', '多用户支持', '数据同步', '设计简约'],
    cons: ['需要APP', '测量精度一般'],
    trending: false,
    lastUpdated: '2026-07-30'
  },

  // Thunt平台产品
  {
    id: 13,
    name: '户外防水蓝牙音箱',
    platform: 'thunt',
    category: '户外用品',
    price: 39.99,
    currency: 'USD',
    salesGrowth: 67,
    rating: 4.6,
    reviewCount: 2345,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 52,
    pros: ['防水设计', '音质好', '续航长', '便携'],
    cons: ['重量稍重', '价格偏高'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 14,
    name: '便携式户外烧烤架',
    platform: 'thunt',
    category: '户外用品',
    price: 49.99,
    currency: 'USD',
    salesGrowth: 134,
    rating: 4.5,
    reviewCount: 876,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 68,
    pros: ['便携设计', '快速组装', '火力强劲', '清洗方便'],
    cons: ['体积较大', '炭火不易控制'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 15,
    name: '露营帐篷 4人家庭款',
    platform: 'thunt',
    category: '户外用品',
    price: 89.99,
    currency: 'USD',
    salesGrowth: 112,
    rating: 4.7,
    reviewCount: 543,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 125,
    pros: ['空间宽敞', '防水防风', '搭建简单', '透气性好'],
    cons: ['重量较大', '价格偏高'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 16,
    name: '户外折叠椅 便携款',
    platform: 'thunt',
    category: '户外用品',
    price: 29.99,
    currency: 'USD',
    salesGrowth: 89,
    rating: 4.4,
    reviewCount: 1234,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 42,
    pros: ['折叠设计', '承重能力强', '舒适度高', '清洗方便'],
    cons: ['重量偏重', '收纳体积较大'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 17,
    name: '户外充电宝 20000mAh',
    platform: 'thunt',
    category: '电子配件',
    price: 34.99,
    currency: 'USD',
    salesGrowth: 98,
    rating: 4.5,
    reviewCount: 1567,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 48,
    pros: ['大容量', '多USB口', '防水设计', '充电快'],
    cons: ['重量较大', '价格偏高'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 18,
    name: '户外头灯 强光款',
    platform: 'thunt',
    category: '户外用品',
    price: 24.99,
    currency: 'USD',
    salesGrowth: 76,
    rating: 4.6,
    reviewCount: 876,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 35,
    pros: ['强光照明', '防水设计', '续航时间长', '佩戴舒适'],
    cons: ['重量偏重', '电池需要更换'],
    trending: false,
    lastUpdated: '2026-07-30'
  },

  // 卖家精灵平台产品
  {
    id: 19,
    name: '可折叠办公桌 升降式',
    platform: 'sellersprite',
    category: '办公家具',
    price: 89.99,
    currency: 'USD',
    salesGrowth: 45,
    rating: 4.4,
    reviewCount: 567,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 120,
    pros: ['可调节高度', '折叠设计', '稳固耐用', '易于安装'],
    cons: ['组装复杂', '重量大'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 20,
    name: '人体工学椅 腰部支撑',
    platform: 'sellersprite',
    category: '办公家具',
    price: 149.99,
    currency: 'USD',
    salesGrowth: 67,
    rating: 4.7,
    reviewCount: 432,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 198,
    pros: ['腰部支撑', '可调节扶手', '透气设计', '承重能力强'],
    cons: ['价格偏高', '组装复杂'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 21,
    name: '显示器支架 电动升降',
    platform: 'sellersprite',
    category: '办公设备',
    price: 79.99,
    currency: 'USD',
    salesGrowth: 78,
    rating: 4.5,
    reviewCount: 321,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 110,
    pros: ['电动升降', '承重能力强', '安装简单', '节省空间'],
    cons: ['价格偏高', '需要桌面开孔'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 22,
    name: '桌面收纳盒 多功能',
    platform: 'sellersprite',
    category: '办公用品',
    price: 19.99,
    currency: 'USD',
    salesGrowth: 112,
    rating: 4.3,
    reviewCount: 1876,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 28,
    pros: ['多功能设计', '材质环保', '空间利用率高', '清洗方便'],
    cons: ['容量有限', '颜色选择少'],
    trending: false,
    lastUpdated: '2026-07-30'
  },
  {
    id: 23,
    name: '无线充电鼠标垫',
    platform: 'sellersprite',
    category: '办公设备',
    price: 29.99,
    currency: 'USD',
    salesGrowth: 89,
    rating: 4.4,
    reviewCount: 654,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 42,
    pros: ['无线充电', '大尺寸设计', '防滑底部', '兼容性强'],
    cons: ['充电速度一般', '价格偏高'],
    trending: true,
    lastUpdated: '2026-07-30'
  },
  {
    id: 24,
    name: '桌面台灯 LED护眼',
    platform: 'sellersprite',
    category: '办公用品',
    price: 39.99,
    currency: 'USD',
    salesGrowth: 95,
    rating: 4.6,
    reviewCount: 432,
    imageUrl: 'https://via.placeholder.com/100',
    alibabaPrice: 55,
    pros: ['护眼设计', '多档调光', '角度可调', '节能省电'],
    cons: ['底座较轻', '电线较短'],
    trending: false,
    lastUpdated: '2026-07-30'
  }
]

export function Products() {
  const [products] = useState<Product[]>(mockProducts)
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesPlatform = selectedPlatform === 'all' || product.platform === selectedPlatform
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPlatform && matchesSearch
  })

  const refreshProducts = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const getGrowthBadge = (growth: number) => {
    if (growth >= 100) {
      return <Badge className="bg-green-100 text-green-800">+{growth}%</Badge>
    } else if (growth >= 50) {
      return <Badge className="bg-blue-100 text-blue-800">+{growth}%</Badge>
    } else {
      return <Badge variant="secondary">+{growth}%</Badge>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">产品分析</h1>
          <p className="text-gray-600">监控各平台新品增长趋势及用户评价</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={refreshProducts}
            disabled={isLoading}
          >
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
          全部平台 ({products.length})
        </Button>
        {platforms.map(platform => {
          const count = products.filter(p => p.platform === platform.id).length
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

      {/* 搜索和筛选 */}
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

      {/* 产品统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-sm text-gray-600">总产品数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.salesGrowth >= 100).length}
              </div>
              <div className="text-sm text-gray-600">高增长产品</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {products.filter(p => p.trending).length}
              </div>
              <div className="text-sm text-gray-600">热门产品</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(products.reduce((sum, p) => sum + p.rating, 0) / products.length * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">平均评分</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 产品列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>
                {product.trending && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    热门
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {/* 价格信息 */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {product.currency} {product.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      1688同款: ¥{product.alibabaPrice}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">销量增长</div>
                    {getGrowthBadge(product.salesGrowth)}
                  </div>
                </div>

                {/* 平台和评分 */}
                <div className="flex items-center justify-between">
                  {getPlatformBadge(product.platform)}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
                  </div>
                </div>

                {/* 用户评价 */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    <span className="font-medium">好评点:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {product.pros.slice(0, 2).map((pro, index) => (
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
                    {product.cons.slice(0, 2).map((con, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-red-50">
                        {con}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    详情
                  </Button>
                  <Button variant="outline" size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    对比价格
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到产品</h3>
          <p className="text-gray-600">
            尝试调整筛选条件或搜索词
          </p>
        </div>
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
                  <span className="text-gray-500">({products.filter(p => p.platform === platform.id).length})</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              数据更新频率: 每日更新 | 最后更新: 2026-07-30 16:00
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}