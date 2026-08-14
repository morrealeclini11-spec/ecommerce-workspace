// 产品品类 -> 示意图 slug 的映射
// 同时供前端（识别产品类型画示意图）与日常脚本（未来接真实图片时写 imageUrl）使用。

export interface SlugRule {
  slug: string
  keys: string[]
  label: string
}

export const SLUG_RULES: SlugRule[] = [
  { slug: 'heater', keys: ['取暖器', 'heater'], label: '取暖器' },
  { slug: 'electric-blanket', keys: ['电热毯', 'electric blanket'], label: '电热毯' },
  { slug: 'hand-warmer', keys: ['暖手宝', 'hand warmer'], label: '暖手宝' },
  { slug: 'air-fryer', keys: ['空气炸锅', 'air fryer'], label: '空气炸锅' },
  { slug: 'humidifier', keys: ['加湿器', 'humidifier'], label: '加湿器' },
  { slug: 'air-purifier', keys: ['净化器', 'purifier'], label: '净化器' },
  { slug: 'robot-vacuum', keys: ['吸尘器', 'vacuum'], label: '吸尘器' },
  { slug: 'smart-plug', keys: ['智能插座', 'smart plug'], label: '智能插座' },
  { slug: 'thermostat', keys: ['温控器', 'thermostat'], label: '温控器' },
  { slug: 'led-strip', keys: ['灯带', 'led strip'], label: '灯带' },
  { slug: 'night-light', keys: ['夜灯', 'night light'], label: '夜灯' },
  { slug: 'power-bank', keys: ['充电宝', 'power bank'], label: '充电宝' },
  { slug: 'tracker', keys: ['追踪器', 'tracker'], label: '追踪器' },
  { slug: 'laptop-stand', keys: ['笔记本支架', 'laptop stand'], label: '笔记本支架' },
  { slug: 'label-maker', keys: ['标签机', 'label maker'], label: '标签机' },
  { slug: 'storage-box', keys: ['收纳', 'storage'], label: '收纳' },
  { slug: 'bag-sealer', keys: ['封口机', 'sealer'], label: '封口机' },
  { slug: 'nail-stickers', keys: ['美甲', 'nail'], label: '美甲' },
  { slug: 'collagen', keys: ['胶原', 'collagen'], label: '胶原' },
  { slug: 'pet-feeder', keys: ['宠物', 'pet'], label: '宠物' },
  { slug: 'fitness', keys: ['健身', 'fitness'], label: '健身' },
  { slug: 'umbrella', keys: ['雨伞', 'umbrella'], label: '雨伞' },
  { slug: 'earbuds', keys: ['耳机', 'headphone'], label: '耳机' },
  { slug: 'coffee-maker', keys: ['咖啡', 'coffee'], label: '咖啡机' },
  { slug: 'blender', keys: ['搅拌机', 'blender'], label: '搅拌机' },
  { slug: 'security-camera', keys: ['摄像头', 'camera'], label: '摄像头' },
]

const SLUG_BY_KEY: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  for (const r of SLUG_RULES) for (const k of r.keys) m[k.toLowerCase()] = r.slug
  return m
})()

/** 根据产品名（含品类关键词）推导示意图 slug，匹配不到返回 generic */
export function slugFor(name: string): string {
  const n = (name || '').toLowerCase()
  for (const r of SLUG_RULES) {
    for (const k of r.keys) {
      if (n.includes(k.toLowerCase())) return r.slug
    }
  }
  // 英文整词兜底
  for (const key of Object.keys(SLUG_BY_KEY)) {
    if (n.includes(key)) return SLUG_BY_KEY[key]
  }
  return 'generic'
}
