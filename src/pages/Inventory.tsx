import { useState, useMemo, useRef, useEffect, Fragment } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus, Search, Upload, Download, Package, MapPin,
  ImagePlus, X, RefreshCw, ArrowUpCircle, ArrowDownCircle, Pencil, Settings2, ListTree,
} from 'lucide-react'
import { useCloudData } from '@/lib/useCloudData'
import { cloudLoad } from '@/lib/cloud'
import { SyncStatus } from '@/components/SyncStatus'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'

/* ========== 类型 ========== */
interface Product {
  id: string; sku: string; name: string; category: string; owner: string
  location: string; unit: string; initial_stock: number; low_threshold: number | null
  image_url: string; created_at: string
}
interface Txn {
  id: string; product_id: string; type: 'IN' | 'OUT'; quantity: number
  occur_at: string; operator: string; note: string; created_at: string
}
type View = Product & { current_stock: number; low_stock: boolean }

/* ========== 工具 ========== */
const fmt = (n: number) => Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
const cleanStr = (v: any) => (v == null ? '' : String(v).trim())
const num = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const max = 120; let w = img.width, h = img.height
        if (w > max || h > max) { if (w >= h) { h = Math.round(h * max / w); w = max } else { w = Math.round(w * max / h); h = max } }
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h
        cv.getContext('2d')!.drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(url)
        resolve(cv.toDataURL('image/jpeg', 0.6))
      } catch (e) { URL.revokeObjectURL(url); reject(e) }
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')) }
    img.src = url
  })
}

/** ========== 行内编辑：商品名称 ========== */
function NameCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  useEffect(() => { if (!editing) setDraft(value) }, [value, editing])
  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { const v = cleanStr(draft); if (v && v !== value) onSave(v); setEditing(false) }}
        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
        className="h-8 text-sm"
      />
    )
  }
  return (
    <span
      className="font-medium cursor-pointer hover:bg-yellow-50 px-1.5 py-0.5 rounded inline-flex items-center gap-1 group"
      title="点击修改名称"
      onClick={() => { setDraft(value); setEditing(true) }}
    >
      {value}
      <Pencil className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100" />
    </span>
  )
}

export function Inventory() {
  /* ========== 数据（工作台同款：本地 + Gitee 云同步，mergeOnLoad 保留并上传本地数据） ========== */
  const [products, setProducts, pSync, pActive] = useCloudData<Product[]>('ec_inv_products_v1', [], { mergeOnLoad: true })
  const [txns, setTxns, tSync, tActive] = useCloudData<Txn[]>('ec_inv_txns_v1', [], { mergeOnLoad: true })
  const [locDict, setLocDict, lSync, lActive] = useCloudData<string[]>('ec_inv_locations_v1', [], { mergeOnLoad: true })
  const syncing = pSync || tSync || lSync
  const cloudActive = pActive || tActive || lActive

  // 手动从云端拉取最新（合并本地独有项，避免丢失）
  const syncFromCloud = async () => {
    toast('正在从云端拉取最新数据…')
    const r1 = await cloudLoad('ec_inv_products_v1')
    if (r1.status === 'ok') {
      const cloud = r1.data as Product[]
      const localIds = new Set(products.map(p => p.id))
      setProducts([...cloud, ...products.filter(p => !localIds.has(p.id))])
    }
    const r2 = await cloudLoad('ec_inv_txns_v1')
    if (r2.status === 'ok') {
      const cloud = r2.data as Txn[]
      const localIds = new Set(txns.map(t => t.id))
      setTxns([...cloud, ...txns.filter(t => !localIds.has(t.id))])
    }
    const r3 = await cloudLoad('ec_inv_locations_v1')
    if (r3.status === 'ok') {
      const cloud = r3.data as string[]
      setLocDict(Array.from(new Set([...cloud, ...locDict])).sort((a, b) => a.localeCompare(b, 'zh')))
    }
    toast('已与云端同步（含同事最新数据）')
  }

  const stockMap = useMemo(() => {
    const m: Record<string, number> = {}
    products.forEach(p => { m[p.id] = num(p.initial_stock) })
    txns.forEach(t => { if (m[t.product_id] == null) m[t.product_id] = 0; m[t.product_id] += (t.type === 'IN' ? 1 : -1) * num(t.quantity) })
    return m
  }, [products, txns])

  const views = useMemo<View[]>(() => products.map(p => {
    const cs = stockMap[p.id] == null ? num(p.initial_stock) : stockMap[p.id]
    const low = p.low_threshold != null && cs <= num(p.low_threshold)
    return { ...p, current_stock: cs, low_stock: low }
  }), [products, stockMap])

  const owners = useMemo(() => {
    const m = new Map<string, { name: string; count: number; stock: number; low: number }>()
    views.forEach(p => {
      const o = cleanStr(p.owner) || '未分组'
      if (!m.has(o)) m.set(o, { name: o, count: 0, stock: 0, low: 0 })
      const e = m.get(o)!
      e.count++; e.stock += num(p.current_stock); if (p.low_stock) e.low++
    })
    return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  }, [views])

  const totalIn = useMemo(() => txns.filter(t => t.type === 'IN').reduce((s, t) => s + num(t.quantity), 0), [txns])
  const totalOut = useMemo(() => txns.filter(t => t.type === 'OUT').reduce((s, t) => s + num(t.quantity), 0), [txns])
  const ownerList = useMemo(() => Array.from(new Set(products.map(p => cleanStr(p.owner)).filter(Boolean))), [products])
  // 位置字典：优先取 locDict，其次合并自商品，去重，按拼音排序
  const locationList = useMemo(() => {
    const fromDict = (locDict || []).map(cleanStr).filter(Boolean)
    const fromData = products.map(p => cleanStr(p.location)).filter(Boolean)
    return Array.from(new Set([...fromDict, ...fromData])).sort((a, b) => a.localeCompare(b, 'zh'))
  }, [locDict, products])

  /* ========== 视图状态 ========== */
  const [tab, setTab] = useState<'board' | 'io' | 'import' | 'log'>('board')
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [selIds, setSelIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState<{ mode: 'add' | 'edit'; p?: Product } | null>(null)
  const [batchEdit, setBatchEdit] = useState<null | { ids: string[]; fields: ('owner' | 'category' | 'location' | 'unit' | 'image_url')[] }>(null)
  const [locMgr, setLocMgr] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const toast = (t: string) => { setToastMsg(t); setTimeout(() => setToastMsg(''), 1800) }

  const filtered = useMemo(() => {
    let list = views
    if (ownerFilter) list = list.filter(p => (cleanStr(p.owner) || '未分组') === ownerFilter)
    if (catFilter) list = list.filter(p => cleanStr(p.category) === catFilter)
    if (locFilter) list = list.filter(p => cleanStr(p.location) === locFilter)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(p => (p.sku || '').toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.owner || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q))
    return list
  }, [views, search, ownerFilter, catFilter, locFilter])

  const categoryList = useMemo(() => Array.from(new Set(views.map(p => cleanStr(p.category)).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh')), [views])
  const locationListBoard = useMemo(() => Array.from(new Set(views.map(p => cleanStr(p.location)).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh')), [views])

  // 看板按主体分组
  const grouped = useMemo(() => {
    const map = new Map<string, typeof views>()
    filtered.forEach(p => {
      const o = cleanStr(p.owner) || '未分组'
      if (!map.has(o)) map.set(o, [])
      map.get(o)!.push(p)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'zh'))
  }, [filtered])

  const toggleSel = (id: string) => {
    const s = new Set(selIds)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelIds(s)
  }
  const toggleAll = () => { setSelIds(filtered.length === selIds.size ? new Set() : new Set(filtered.map(p => p.id))) }
  const toggleGroup = (owner: string) => {
    const ids = (grouped.find(g => g[0] === owner)?.[1] || []).map(p => p.id)
    const allSel = ids.length > 0 && ids.every(id => selIds.has(id))
    const s = new Set(selIds)
    ids.forEach(id => { if (allSel) s.delete(id); else s.add(id) })
    setSelIds(s)
  }

  /* ========== 商品 CRUD ========== */
  const saveProduct = (data: Omit<Product, 'id' | 'created_at'>, id?: string) => {
    if (id) {
      setProducts(products.map(p => (p.id === id ? { ...p, ...data } : p)))
    } else {
      setProducts([{ id: uid('p'), ...data, created_at: new Date().toISOString() }, ...products])
    }
    setForm(null)
  }
  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
    setTxns(txns.filter(t => t.product_id !== id))
    toast('已删除')
  }
  const batchDelete = () => {
    const ids = Array.from(selIds)
    if (!ids.length) return
    setProducts(products.filter(p => !ids.includes(p.id)))
    setTxns(txns.filter(t => !ids.includes(t.product_id)))
    setSelIds(new Set()); toast(`已删除 ${ids.length} 个`)
  }
  const inlineEdit = (id: string, patch: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  /* ========== 出入库 ========== */
  const [ioForm, setIoForm] = useState({ owner: '', product_id: '', type: 'IN' as 'IN' | 'OUT', quantity: '', occur_at: '', operator: '', note: '' })
  const [ioNew, setIoNew] = useState<null | { name: string; sku: string; category: string; location: string; unit: string }>(null)
  const [ioNewOwner, setIoNewOwner] = useState('')
  // 出入库中"当前主体"解析：新建主体用输入值，否则用下拉值
  const ioOwnerResolved = ioForm.owner === '__new__' ? cleanStr(ioNewOwner) : ioForm.owner
  // 当前主体下的商品（供出入库选择）
  const ioProducts = useMemo(() => views.filter(p => !ioForm.owner || p.owner === ioForm.owner), [views, ioForm.owner])
  const createProductFromIo = () => {
    if (!ioNew || !cleanStr(ioNew.name)) { toast('请填写商品名称'); return }
    const np: Product = {
      id: uid('p'), sku: cleanStr(ioNew.sku), name: cleanStr(ioNew.name), category: cleanStr(ioNew.category),
      owner: ioOwnerResolved, location: cleanStr(ioNew.location), unit: cleanStr(ioNew.unit) || '件',
      initial_stock: 0, low_threshold: null, image_url: '', created_at: new Date().toISOString(),
    }
    setProducts([np, ...products])
    if (cleanStr(ioNew.location) && !(locDict || []).includes(cleanStr(ioNew.location))) setLocDict([...(locDict || []), cleanStr(ioNew.location)].sort((a, b) => a.localeCompare(b, 'zh')))
    setIoForm({ ...ioForm, owner: ioOwnerResolved || '', product_id: np.id })
    setIoNew(null)
    toast('已创建并选中商品')
  }
  const submitIo = () => {
    const p = products.find(x => x.id === ioForm.product_id)
    if (!p) { toast('请选择商品'); return }
    const qty = num(ioForm.quantity)
    if (qty <= 0) { toast('数量需大于 0'); return }
    setTxns([{ id: uid('t'), product_id: p.id, type: ioForm.type, quantity: qty, occur_at: ioForm.occur_at ? new Date(ioForm.occur_at).toISOString() : new Date().toISOString(), operator: cleanStr(ioForm.operator), note: cleanStr(ioForm.note), created_at: new Date().toISOString() }, ...txns])
    setIoForm({ ...ioForm, quantity: '', note: '', operator: '' })
    toast('已登记')
  }

  /* ========== Excel 导入 ========== */
  const fileRef = useRef<HTMLInputElement>(null)
  const [importState, setImportState] = useState<{
    headers: string[]; rows: Record<string, string>[]; srcRows: number[]; images: Record<number, string>; headerIdx: number; imgWarn?: string
  } | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [confirmStep, setConfirmStep] = useState<null | 'dup' | 'owner'>(null)
  const [dupRows, setDupRows] = useState<any[]>([])
  const [dupKeep, setDupKeep] = useState<Set<any>>(new Set())
  const [ownerRows, setOwnerRows] = useState<any[]>([])
  const [ownerMap, setOwnerMap] = useState<Record<string, string>>({})
  const [ownerAll, setOwnerAll] = useState('')
  const [pendingImgRow, setPendingImgRow] = useState<number | null>(null)
  const rowImgRef = useRef<HTMLInputElement>(null)

  /* ========== 智能识别 Excel 表头 ========== */
// 把常见的列名（中英）+同义词映射到系统字段。匹配规则包含原词、关键词、英文别名。
const HEADER_RULES: { field: 'sku' | 'name' | 'category' | 'owner' | 'location' | 'unit' | 'initial_stock' | 'image'; keys: RegExp[] }[] = [
  { field: 'sku', keys: [/^sku$/i, /编码/, /条码/, /编号/, /货号/, /item[ _-]?no/i, /code/i] },
  { field: 'name', keys: [/商品/, /名称/, /产品名?/, /品名?/, /^name$/i, /^product$/i, /item[ _-]?name/i, /title/i] },
  { field: 'category', keys: [/类别/, /分类/, /品类/, /^type$/i, /^category$/i, /class/i] },
  { field: 'owner', keys: [/主体/, /店铺/, /公司/, /品牌/, /vendor/i, /seller/i, /owner/i, /brand/i] },
  { field: 'location', keys: [/位置/, /货架/, /库位/, /仓位/, /location/i, /shelf/i, /storage/i, /warehouse/i] },
  { field: 'unit', keys: [/单位/, /^unit$/i, /^uom$/i] },
  { field: 'initial_stock', keys: [/数量/, /库存/, /初始库存/, /qty/i, /quantity/i, /stock/i, /^count$/i, /pcs/i] },
  { field: 'image', keys: [/图片/, /图$/, /照片/, /相/, /^image$/i, /^img$/i, /picture/i, /photo/i, /pic$/i, /链接/, /url/i] },
]
// 过滤掉 _EMPTY / 空白
const cleanCell = (c: any) => {
  const s = c == null ? '' : String(c).trim()
  if (!s) return ''
  if (/^_+EMPTY/i.test(s)) return ''
  return s
}
// 给一行打分：含「表头关键字」数量越多越高；同时把"看起来像分组/页眉"行降权
function scoreHeaderRow(cells: string[]) {
  const hit = HEADER_RULES.reduce((s, r) => s + (cells.some(c => r.keys.some(k => k.test(c))) ? 1 : 0), 0)
  if (hit < 2) return -1
  let penalty = 0
  // 含"第 X 页" / "新奇特" / "总计" / "小计" / "序号" 等视为分组标题
  const groupKw = /(第.{0,4}页|新奇特|总计|小计|汇总|序号|页码)/
  penalty += cells.filter(c => groupKw.test(c)).length * 1.2
  return hit * 2 - penalty
}
function matchField(header: string): 'sku' | 'name' | 'category' | 'owner' | 'location' | 'unit' | 'initial_stock' | 'image' | null {
  if (!header) return null
  for (const r of HEADER_RULES) { if (r.keys.some(k => k.test(header))) return r.field }
  return null
}

/* ========== 从 .xlsx 抽取嵌入单元格图片 ==========
 * SheetJS 免费版读不到嵌入图片，这里直接解析 xlsx(zip) 内部的
 * drawings + media，把图片绑定到 1-based 表行号返回。
 * 策略：
 *  1) 优先用 twoCellAnchor/oneCellAnchor 的 from-row 锚定到行；
 *  2) 兜底：若嵌入图片总数 == 数据行数，则按 zip 内图片顺序（image1,image2…）
 *     依次绑到数据第 1..N 行（覆盖 WPS/Excel 的浮图 absoluteAnchor 场景）。
 * 返回 Map<number(1-based sheet row), dataURL>
 */
async function extractXlsxImages(buf: ArrayBuffer, sheetName: string, dataStartRow: number, dataRowCount: number): Promise<Map<number, string>> {
  const out = new Map<number, string>()
  try {
    const zip = await JSZip.loadAsync(buf)
    const read = async (p: string) => { const f = zip.file(p); return f ? await f.async('string') : '' }
    const readBytes = async (p: string) => { const f = zip.file(p); return f ? await f.async('uint8array') : null }
    const normPath = (base: string, rel: string) => {
      // 处理 ./ 与 ../ 的相对路径拼接
      const parts = (base.replace(/\/[^/]*$/, '') + '/' + rel).split('/')
      const st: string[] = []
      for (const p of parts) {
        if (p === '' || p === '.') continue
        if (p === '..') st.pop()
        else st.push(p)
      }
      return st.join('/')
    }

    // 1) sheet 名 -> r:id
    const wb = await read('xl/workbook.xml')
    let sheetRid = ''
    const sheetEls = wb.match(/<sheet\b[^>]*>/g) || []
    for (const el of sheetEls) {
      const nm = (el.match(/name="([^"]+)"/) || [])[1]
      const rid = (el.match(/r:id="([^"]+)"/) || [])[1]
      if (nm === sheetName && rid) { sheetRid = rid; break }
    }
    if (!sheetRid) return out
    // 2) workbook rels: r:id -> worksheets/sheetN.xml
    const wbRels = await read('xl/_rels/workbook.xml.rels')
    const sheetFile = (wbRels.match(new RegExp(`<Relationship[^>]*Id="${sheetRid}"[^>]*Target="([^"]+)"`)) || [])[1]
    if (!sheetFile) return out
    const sheetPath = normPath('xl/workbook.xml', sheetFile)
    // 3) sheet xml 里找 drawing r:id
    const sheetXml = await read(sheetPath)
    const drawRid = (sheetXml.match(/<(?:[^:]+:)?drawing[^>]*r:id="([^"]+)"/) || [])[1]
    if (!drawRid) return out
    // 4) sheet rels: drawing r:id -> drawings/drawingN.xml
    const sheetRelsPath = normPath(sheetPath, '_rels/' + sheetPath.replace(/^.*\//, '') + '.rels')
    const sheetRels = await read(sheetRelsPath)
    const drawFile = (sheetRels.match(new RegExp(`<Relationship[^>]*Id="${drawRid}"[^>]*Target="([^"]+)"`)) || [])[1]
    if (!drawFile) return out
    const drawPath = normPath(sheetPath, drawFile)
    // 5) drawing xml: 锚点 -> from row + blip r:embed
    const drawXml = await read(drawPath)
    const drawRelsPath = normPath(drawPath, '_rels/' + drawPath.replace(/^.*\//, '') + '.rels')
    const drawRels = await read(drawRelsPath)
    const anchorRe = /<(?:[^:]+:)?(twoCellAnchor|oneCellAnchor)>([\s\S]*?)<\/(?:[^:]+:)?\1>/g
    let m: RegExpExecArray | null
    const decodeMedia = async (blipId: string, row0: number) => {
      const media = (drawRels.match(new RegExp(`<Relationship[^>]*Id="${blipId}"[^>]*Target="([^"]+)"`)) || [])[1]
      if (!media) return
      const mediaPath = normPath(drawPath, media)
      const bytes = await readBytes(mediaPath)
      if (!bytes) return
      const ext = (media.match(/\.([a-z0-9]+)$/i) || ['png'])[1].toLowerCase()
      let bin = ''
      const CH = 0x8000
      for (let s = 0; s < bytes.length; s += CH) bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(s, s + CH)))
      out.set(row0, `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${btoa(bin)}`)
    }
    while ((m = anchorRe.exec(drawXml))) {
      const body = m[2]
      const rowM = body.match(/<(?:[^:]+:)?from>[\s\S]*?<(?:[^:]+:)?row>(\d+)<\//)
      const blipM = body.match(/r:embed="([^"]+)"/)
      if (!rowM || !blipM) continue
      await decodeMedia(blipM[1], parseInt(rowM[1], 10) + 1) // 0-based -> 1-based
    }
    // 6) 兜底：当完全没锚定到任何行（纯浮动图/absoluteAnchor）时，
    //    若 zip 内图片数 == 数据行数，则按文件名数字序 1:1 绑定到数据行。
    if (out.size === 0) {
      const mediaFiles = Object.keys(zip.files)
        .filter(p => /xl\/media\/.+\.(png|jpe?g|gif|webp|bmp)$/i.test(p))
        .sort((a, b) => {
          const na = parseInt((a.match(/(\d+)/) || [0])[1], 10)
          const nb = parseInt((b.match(/(\d+)/) || [0])[1], 10)
          return na - nb
        })
      if (mediaFiles.length > 0 && mediaFiles.length <= dataRowCount) {
        const n = Math.min(mediaFiles.length, dataRowCount)
        for (let i = 0; i < n; i++) {
          const p = mediaFiles[i]
          const b = await zip.file(p)!.async('uint8array')
          const ext = (p.match(/\.([a-z0-9]+)$/i) || ['png'])[1].toLowerCase()
          let bin = ''
          const CH = 0x8000
          for (let s = 0; s < b.length; s += CH) bin += String.fromCharCode.apply(null, Array.from(b.subarray(s, s + CH)))
          out.set(dataStartRow + i, `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${btoa(bin)}`)
        }
      }
    }
  } catch (e) { /* 解析失败不影响文本导入 */ }
  return out
}

/* ========== WPS/Office365 cellimages (DISPIMG) 解析 ==========
 * WPS 的"单元格图片"用 =DISPIMG("ID_xxx",1) 公式 + xl/cellimages.xml 存储，
 * 不走传统 drawing 锚定。这里通过 ID 匹配把图抽出来。
 * 每张图读取后立即压缩到 150x150 + JPEG 0.4 质量，避免内存溢出。
 * 返回 Map<1-based sheet row, dataURL>
 */
async function extractDispimgImages(
  buf: ArrayBuffer,
  ws: XLSX.WorkSheet,
  headerIdx: number
): Promise<Map<number, string>> {
  const out = new Map<number, string>()
  try {
    const zip = await JSZip.loadAsync(buf)
    // 0) 辅助：压缩图片 bytes → 小 dataURL
    const compressToThumb = (bytes: Uint8Array, ext: string): Promise<string> => new Promise((resolve, reject) => {
      const blob = new Blob([bytes], { type: `image/${ext}` })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const max = 150
        let w = img.width, h = img.height
        if (w > max || h > max) { const s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s) }
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h
        cv.getContext('2d')!.drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(url)
        resolve(cv.toDataURL('image/jpeg', 0.4))
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img load fail')) }
      img.src = url
    })
    // 1) 遍历 worksheet 原始单元格，找 =DISPIMG("ID_xxx"...)
    const rowImgIds = new Map<number, string>()
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref'])
      for (let r = range.s.r + 1; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cell = ws[XLSX.utils.encode_cell({ r, c })]
          if (!cell) continue
          const sources = [cell.f, cell.w, cell.v].filter(Boolean).map(String)
          for (const src of sources) {
            const m = src.match(/DISPIMG\(\s*"([^"]+)"/i)
            if (m) { rowImgIds.set(r + 1, m[1]); break }
          }
          if (rowImgIds.has(r + 1)) break
        }
      }
    }
    console.log('[cellimages] DISPIMG 数量:', rowImgIds.size)
    if (rowImgIds.size === 0) return out
    // 2) 读 cellimages.xml → name -> rId
    const ciXml = await (async () => { const f = zip.file('xl/cellimages.xml'); return f ? await f.async('string') : '' })()
    if (!ciXml) return out
    const idToRId = new Map<string, string>()
    const blockRe = /<etc:cellImage>([\s\S]*?)<\/etc:cellImage>/g
    let bm: RegExpExecArray | null
    while ((bm = blockRe.exec(ciXml))) {
      const block = bm[1]
      const nameM = block.match(/name="([^"]+)"/)
      const ridM = block.match(/r:embed="(rId\d+)"/)
      if (nameM && ridM) idToRId.set(nameM[1], ridM[1])
    }
    if (idToRId.size === 0) return out
    // 3) 读 cellimages.xml.rels → rId -> media file
    const ciRelsXml = await (async () => { const f = zip.file('xl/_rels/cellimages.xml.rels'); return f ? await f.async('string') : '' })()
    const ridToMedia = new Map<string, string>()
    for (const rm of ciRelsXml.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g)) {
      ridToMedia.set(rm[1], rm[2])
    }
    // 4) 逐个读取 + 压缩 + 绑定（避免一次性加载全部图片导致内存溢出）
    let ok = 0, fail = 0
    for (const [row, dispId] of rowImgIds) {
      try {
        const rId = idToRId.get(dispId)
        if (!rId) { fail++; continue }
        const mediaRel = ridToMedia.get(rId)
        if (!mediaRel) { fail++; continue }
        const mediaPath = 'xl/' + mediaRel.replace(/^\.\//, '')
        const bytes = await zip.file(mediaPath)?.async('uint8array')
        if (!bytes) { fail++; continue }
        const ext = (mediaPath.match(/\.([a-z0-9]+)$/i) || ['jpeg'])[1].toLowerCase()
        const dataUrl = await compressToThumb(bytes, ext === 'jpg' ? 'jpeg' : ext)
        out.set(row, dataUrl)
        ok++
      } catch { fail++ }
    }
    console.log('[cellimages] 成功:', ok, '失败:', fail)
  } catch (e) { console.log('[cellimages] 异常:', e) }
  return out
}


  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    e.target.value = ''
    try {
      const buf = await f.arrayBuffer()
      // xlsx 0.20.x 不支持直接读取嵌入图片；如有需要用户可手动上传图片到对应商品
      const wb = XLSX.read(buf, { type: 'array' } as any)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const arr = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' })
      if (!arr.length) { toast('未读取到数据'); return }
      // 找表头：在前 20 行里挑分数最高的那行
      let best = 0, bestScore = -1
      for (let i = 0; i < Math.min(20, arr.length); i++) {
        const cells = (arr[i] || []).map(cleanCell)
        const sc = scoreHeaderRow(cells)
        if (sc > bestScore) { bestScore = sc; best = i }
      }
      // 完全识别不到时：如果首行单元格 >= 2 个非空，仍当成表头（兜底）
      if (bestScore < 0) {
        const firstRow = (arr[0] || []).map(cleanCell)
        if (firstRow.filter(Boolean).length >= 2) { best = 0 }
        else { toast('没识别到表头，请确认第一行是表头（图片/商品/类别/数量/位置之类）'); return }
      }
      const headerIdx = best
      const headers = (arr[headerIdx] || []).map(c => cleanCell(c))
      const rows: Record<string, string>[] = []
      const srcRows: number[] = []
      arr.slice(headerIdx + 1).forEach((row, off) => {
        const cells = (row || []).map(c => cleanCell(c))
        if (cells.filter(c => c !== '').length < 2) return
        // 跳过整行是「第 X 页」之类的合并分组行
        if (cells.every(c => c === '' || /第.{0,4}页/.test(c))) return
        const obj: Record<string, string> = {}
        headers.forEach((h, idx) => { obj[h || '_col' + idx] = row[idx] != null ? cleanCell(row[idx]) : '' })
        rows.push(obj); srcRows.push(headerIdx + 1 + off + 1)
      })
      // 抽取 Excel 中嵌入的单元格图片（按锚定行 / 顺序兜底绑定到 1-based 表行）
      const images: Record<number, string> = {}
      let imgWarn = ''
      try {
        const dataStartRow = headerIdx + 2 // 1-based 数据第一行
        const emb = await extractXlsxImages(buf, wb.SheetNames[0], dataStartRow, rows.length)
        emb.forEach((v, k) => { images[k] = v })
      } catch (e) { /* 解析失败不影响文本导入 */ }
      // 如果传统方式没抽到图，尝试 WPS cellimages (DISPIMG) 解析
      if (Object.keys(images).length === 0) {
        try {
          toast('检测到 WPS 图片格式，正在处理图片…（可能需要几秒）')
          const dispimg = await extractDispimgImages(buf, ws, headerIdx)
          dispimg.forEach((v, k) => { images[k] = v })
          if (Object.keys(images).length > 0) toast(`✓ 自动带上了 ${Object.keys(images).length} 张图片`)
        } catch (e) { console.log('[cellimages] 调用异常:', e) }
      }
      if (Object.keys(images).length === 0) {
        imgWarn = '⚠️ 未从 Excel 检测到图片。可能原因：① 图片是「链接到文件」或旧版 .xls；② 图片列含 =DISPIMG 公式但 WPS 格式不匹配。可点每行「补图」手动上传。'
      }
      // 自动映射（image 列需要二次校验：列里大多数是合法 URL 才认成图）
      const auto: Record<string, string> = {}
      headers.forEach(h => { const f = matchField(h); if (f && !auto[f]) auto[f] = h })
      // 如果被识别为 image 的列里，合法 URL 行数 < 60%，降级（很可能是文字被误识别）
      if (auto.image) {
        const col = auto.image
        const nonEmpty = rows.filter(r => cleanStr(r[col])).length
        const valid = rows.filter(r => { const v = cleanStr(r[col]); return /^https?:\/\//i.test(v) || /^data:image\//i.test(v) }).length
        if (nonEmpty > 0 && valid / nonEmpty < 0.6) {
          // 尝试把 image 字段让给其他未分配的"图"字相关列；都没有就直接放弃
          const alt = headers.find(h => h !== col && (/图片|图|照片|链接|URL/i.test(h) || /^image$|^img$|^picture$|^photo$/i.test(h)) && !Object.values(auto).includes(h))
          if (alt) auto.image = alt
          else delete auto.image
        }
      }
      setImportState({ headers, rows, srcRows, images, headerIdx })
      setMapping(auto)
      setConfirmStep(null)
      const showImg = Object.keys(images).length
      const showMap = Object.keys(auto).length
      const tip = [`已读取 ${rows.length} 行`]
      if (showImg) tip.push(`图片 ${showImg} 张`)
      if (showMap) tip.push(`自动映射 ${showMap} 个字段`)
      else tip.push('未识别到表头字段，请手动选择')
      toast(tip.join('，'))
    } catch (err: any) {
      toast('读取失败：' + (err?.message || ''))
    }
  }

  const doImport = () => {
    if (!importState) return
    const m = mapping
    if (!m.name) { toast('请至少映射「商品名称」'); return }
    const rows = importState.rows.map((r, i) => {
      const cellImg = mapping.image ? cleanStr(r[mapping.image]) : ''
      const validCellImg = /^https?:\/\//i.test(cellImg) || /^data:image\//i.test(cellImg) ? cellImg : ''
      return {
        sku: r[m.sku] || '', name: r[m.name] || '', category: r[m.category] || '', owner: r[m.owner] || '',
        location: r[m.location] || '', unit: r[m.unit] || '', initial_stock: r[m.initial_stock] || 0,
        image_url: importState.images[importState.srcRows[i]] || validCellImg, _src: i,
      }
    }).filter(r => r.name)
    // 重复检测
    const bySku = new Map(products.filter(p => p.sku).map(p => [cleanStr(p.sku).toLowerCase(), p]))
    const byName = new Map(products.map(p => [cleanStr(p.name).toLowerCase(), p]))
    const dups = rows.filter(r => (r.sku && bySku.has(cleanStr(r.sku).toLowerCase())) || byName.has(cleanStr(r.name).toLowerCase()))
    if (dups.length) { setDupRows(dups); setDupKeep(new Set()); setConfirmStep('dup'); return }
    // 主体确认
    if (rows.some(r => !cleanStr(r.owner))) { setOwnerRows(rows); setOwnerMap({}); setOwnerAll(''); setConfirmStep('owner'); return }
    finishImport(rows)
  }

  const finishImport = (rows: any[]) => {
    let added = 0, updated = 0
    const newProducts = [...products]
    // 收集本次导入出现的位置 / 主体，便于同步进字典
    const newLocSet = new Set<string>()
    const newOwnerSet = new Set<string>()
    rows.forEach(r => {
      const dup = products.find(p => (r.sku && cleanStr(p.sku).toLowerCase() === cleanStr(r.sku).toLowerCase()) || cleanStr(p.name).toLowerCase() === cleanStr(r.name).toLowerCase())
      if (dup) {
        let changed = false
        if (r.owner && !cleanStr(dup.owner)) { dup.owner = r.owner; changed = true }
        if (r.location && !cleanStr(dup.location)) { dup.location = r.location; changed = true }
        // 只在「旧图无效 + 新图合法」时回填，避免覆盖
        const newImg = r.image_url
        if (newImg && !cleanStr(dup.image_url)) { dup.image_url = newImg; changed = true }
        if (changed) updated++
        return
      }
      const loc = cleanStr(r.location)
      const own = cleanStr(r.owner)
      if (loc) newLocSet.add(loc)
      if (own) newOwnerSet.add(own)
      newProducts.push({ id: uid('p'), sku: cleanStr(r.sku), name: cleanStr(r.name), category: cleanStr(r.category), owner: own, location: loc, unit: cleanStr(r.unit) || '件', initial_stock: num(r.initial_stock), low_threshold: null, image_url: r.image_url || '', created_at: new Date().toISOString() })
      added++
    })
    // 把首次出现的位置加进字典
    if (newLocSet.size) {
      const merged = Array.from(new Set([...(locDict || []), ...newLocSet])).sort((a, b) => a.localeCompare(b, 'zh'))
      setLocDict(merged)
    }
    setProducts(newProducts)
    setConfirmStep(null)
    setImportState(null)
    toast(`导入 ${added} 个商品${updated ? `，补充信息 ${updated} 个` : ''}${newLocSet.size ? `，新增位置 ${newLocSet.size} 个` : ''}`)
    setTab('board')
  }

  const finishDup = () => {
    const keepRows = dupRows.filter(r => dupKeep.has(r))
    const allRows = importState ? importState.rows.map((r, i) => ({ sku: r[mapping.sku] || '', name: r[mapping.name] || '', category: r[mapping.category] || '', owner: r[mapping.owner] || '', location: r[mapping.location] || '', unit: r[mapping.unit] || '', initial_stock: r[mapping.initial_stock] || 0, image_url: importState.images[importState.srcRows[i]] || (mapping.image ? (r[mapping.image] || '') : '') })).filter(r => r.name) : []
    const nonDup = allRows.filter(r => !dupRows.includes(r))
    const next = [...nonDup, ...keepRows]
    if (next.some(r => !cleanStr(r.owner))) { setOwnerRows(next); setOwnerMap({}); setOwnerAll(''); setConfirmStep('owner'); return }
    finishImport(next)
  }

  const finishOwner = () => {
    const finalRows = ownerRows.map(r => ({ ...r, owner: cleanStr(r.owner) || ownerMap[r.name] || '' }))
    finishImport(finalRows)
  }

  /* ========== 流水记录 ========== */
  const [logFilter, setLogFilter] = useState({ type: '', from: '', to: '' })
  const logList = useMemo(() => {
    let list = txns.slice()
    if (logFilter.type) list = list.filter(t => t.type === logFilter.type)
    if (logFilter.from) list = list.filter(t => new Date(t.occur_at) >= new Date(logFilter.from))
    if (logFilter.to) list = list.filter(t => new Date(t.occur_at) <= new Date(logFilter.to + 'T23:59:59'))
    list.sort((a, b) => new Date(b.occur_at).getTime() - new Date(a.occur_at).getTime())
    return list.slice(0, 200).map(t => { const p = products.find(x => x.id === t.product_id); return { ...t, sku: p ? p.sku : '', name: p ? p.name : '(已删除)', unit: p ? p.unit : '' } })
  }, [txns, products, logFilter])

  /* ========== 备份 ========== */
  const backup = () => {
    const blob = new Blob([JSON.stringify({ products, transactions: txns }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'inventory-backup.json'; a.click()
    toast('已导出备份')
  }

  /* ========== UI ========== */
  const navs = [
    { id: 'board', label: '库存看板' },
    { id: 'io', label: '登记出入库' },
    { id: 'import', label: 'Excel 导入' },
    { id: 'log', label: '流水记录' },
  ] as const

  return (
    <div className="space-y-4">
      {/* 顶部 */}
      {/* 顶部按钮区（位置字典 + 新增） */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">电商实时库存</h2>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            <SyncStatus syncing={syncing} cloudActive={cloudActive} />
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={syncFromCloud} disabled={syncing}><RefreshCw className={`mr-1.5 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />从云端刷新</Button>
          <Button variant="outline" size="sm" onClick={() => setLocMgr(true)}><ListTree className="mr-1.5 h-4 w-4" />位置字典（{locationList.length}）</Button>
          <Button variant="outline" size="sm" onClick={backup}><Download className="mr-1.5 h-4 w-4" />备份</Button>
          <Button size="sm" onClick={() => setForm({ mode: 'add' })}><Plus className="mr-1.5 h-4 w-4" />新增商品</Button>
        </div>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-500">商品种类</div><div className="text-2xl font-bold mt-1">{products.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-500">累计入库</div><div className="text-2xl font-bold mt-1 text-green-600">{fmt(totalIn)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-500">累计出库</div><div className="text-2xl font-bold mt-1 text-red-600">{fmt(totalOut)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-500">主体数量</div><div className="text-2xl font-bold mt-1 text-blue-600">{owners.length}</div></CardContent></Card>
      </div>

      {/* 按主体 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm font-semibold">按主体看库存</span>
            <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="text-sm border rounded-md px-2 py-1">
              <option value="">全部主体</option>
              {owners.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
            {owners.length === 0 && <div className="text-sm text-gray-400 col-span-full">暂无主体数据，给商品设置主体后这里会显示</div>}
            {owners.map(o => (
              <button key={o.name} onClick={() => setOwnerFilter(ownerFilter === o.name ? '' : o.name)}
                className={`text-left p-3 rounded-xl border transition ${ownerFilter === o.name ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="text-sm font-bold text-blue-600">{o.name}</div>
                <div className="text-xl font-bold mt-1">{fmt(o.stock)}</div>
                <div className="text-xs text-gray-500">{o.count} 种商品</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab 导航 */}
      <div className="flex gap-1 border-b flex-wrap">
        {navs.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === n.id ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
            {n.label}
          </button>
        ))}
      </div>

      {/* ===== 库存看板 ===== */}
      {tab === 'board' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索 SKU / 名称 / 分类 / 位置 / 主体" className="pl-9" />
              </div>
              <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="text-sm border rounded-md px-2 py-1.5">
                <option value="">全部主体</option>
                {owners.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
              </select>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="text-sm border rounded-md px-2 py-1.5">
                <option value="">全部分类</option>
                {categoryList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={locFilter} onChange={e => setLocFilter(e.target.value)} className="text-sm border rounded-md px-2 py-1.5">
                <option value="">全部位置</option>
                {locationListBoard.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {(ownerFilter || catFilter || locFilter || search) && (
                <Button variant="ghost" size="sm" onClick={() => { setOwnerFilter(''); setCatFilter(''); setLocFilter(''); setSearch('') }}>清除筛选</Button>
              )}
              <span className="text-sm text-gray-500 ml-auto">{selIds.size ? `已选 ${selIds.size} 个` : '未选中'}</span>
              <Button variant="outline" size="sm" disabled={!selIds.size} onClick={() => setBatchEdit({ ids: Array.from(selIds), fields: ['owner', 'category', 'location', 'unit', 'image_url'] })}><Settings2 className="mr-1 h-4 w-4" />批量编辑</Button>
              <Button variant="outline" size="sm" disabled={!selIds.size} className="text-red-600" onClick={batchDelete}>批量删除</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-1 w-8"><input type="checkbox" checked={filtered.length > 0 && selIds.size === filtered.length} onChange={toggleAll} /></th>
                    <th className="py-2 pr-2 w-14">图片</th>
                    <th className="py-2 pr-3">SKU</th>
                    <th className="py-2 pr-3">商品名称</th>
                    <th className="py-2 pr-3">分类</th>
                    <th className="py-2 pr-3">位置</th>
                    <th className="py-2 pr-3">单位</th>
                    <th className="py-2 pr-3">当前库存</th>
                    <th className="py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-400">还没有商品，去「Excel 导入」或点「+ 新增商品」</td></tr>}
                  {grouped.map(([owner, items]) => {
                    const isCollapsed = collapsed.has(owner)
                    const groupSel = items.length > 0 && items.every(p => selIds.has(p.id))
                    const groupStock = items.reduce((s, p) => s + p.current_stock, 0)
                    return (
                      <Fragment key={owner}>
                        <tr className="bg-gray-50 border-b">
                          <td className="py-2 pr-1"><input type="checkbox" checked={groupSel} onChange={() => toggleGroup(owner)} /></td>
                          <td colSpan={8} className="py-2 pr-3">
                            <button onClick={() => { const s = new Set(collapsed); if (isCollapsed) s.delete(owner); else s.add(owner); setCollapsed(s) }}
                              className="flex items-center gap-2 font-semibold text-gray-800">
                              <span className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▾</span>
                              <Badge variant="secondary">{owner}</Badge>
                              <span className="text-xs text-gray-500 font-normal">{items.length} 种 · 库存 {fmt(groupStock)}</span>
                            </button>
                          </td>
                        </tr>
                        {!isCollapsed && items.map(p => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 pr-1"><input type="checkbox" checked={selIds.has(p.id)} onChange={() => toggleSel(p.id)} /></td>
                            <td className="py-2 pr-2">
                              {p.image_url
                                ? <img
                                  src={p.image_url}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded-lg border"
                                  loading="lazy"
                                  onError={(e) => { const el = e.currentTarget; if (el) { el.style.display = 'none'; const sib = el.nextElementSibling as HTMLElement | null; if (sib) sib.style.display = 'inline' } }}
                                />
                                : <span className="text-gray-300">—</span>}
                              {p.image_url && <span className="text-gray-300" style={{ display: 'none' }}>—</span>}
                            </td>
                            <td className="py-2 pr-3">{p.sku || <span className="text-gray-300">—</span>}</td>
                            <td className="py-2 pr-3"><NameCell value={p.name} onSave={(v) => inlineEdit(p.id, { name: v })} /></td>
                            <td className="py-2 pr-3">{p.category || <span className="text-gray-300">—</span>}</td>
                            <td className="py-2 pr-3">{p.location ? <span className="inline-flex items-center text-gray-600"><MapPin className="h-3.5 w-3.5 mr-1" />{p.location}</span> : <span className="text-gray-300">—</span>}</td>
                            <td className="py-2 pr-3">{p.unit}</td>
                            <td className={`py-2 pr-3 font-bold ${p.low_stock ? 'text-red-600' : ''}`}>{fmt(p.current_stock)}</td>
                            <td className="py-2 whitespace-nowrap">
                              <Button variant="ghost" size="sm" onClick={() => setForm({ mode: 'edit', p })}>编辑</Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('删除该商品及其所有流水？')) deleteProduct(p.id) }}>删除</Button>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== 出入库 ===== */}
      {tab === 'io' && (() => {
        const sel = views.find(p => p.id === ioForm.product_id)
        return (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-base font-semibold mb-3">登记出入库</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500 font-medium">主体 *</label>
                <select value={ioForm.owner} onChange={e => { const v = e.target.value; setIoForm({ ...ioForm, owner: v, product_id: '' }); if (v !== '__new__') setIoNewOwner('') }} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
                  <option value="">请选择主体</option>
                  {owners.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                  <option value="__new__">＋ 新建主体…</option>
                </select>
                {ioForm.owner === '__new__' && <Input value={ioNewOwner} onChange={e => setIoNewOwner(e.target.value)} placeholder="输入新主体名称" className="mt-2" />}
              </div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">商品 *{ioOwnerResolved ? `（${ioOwnerResolved} 的商品）` : ''}</label>
                <select value={ioForm.product_id} onChange={e => { const v = e.target.value; if (v === '__new__') { setIoNew({ name: '', sku: '', category: '', location: '', unit: '件' }); return } setIoForm({ ...ioForm, product_id: v }) }} className="w-full mt-1 text-sm border rounded-md px-3 py-2" disabled={!ioOwnerResolved}>
                  <option value="">{ioOwnerResolved ? '请选择商品' : '请先选主体'}</option>
                  {ioProducts.map(p => <option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ''} · 余{fmt(p.current_stock)}</option>)}
                  <option value="__new__">＋ 新建商品…</option>
                </select>
                {ioNew && (
                  <div className="mt-2 grid md:grid-cols-5 gap-2 items-end p-3 bg-gray-50 rounded-lg border">
                    <div className="md:col-span-2"><label className="text-xs text-gray-500">商品名称 *</label><Input value={ioNew.name} onChange={e => setIoNew({ ...ioNew, name: e.target.value })} placeholder="必填" className="mt-1" /></div>
                    <div><label className="text-xs text-gray-500">SKU</label><Input value={ioNew.sku} onChange={e => setIoNew({ ...ioNew, sku: e.target.value })} className="mt-1" /></div>
                    <div><label className="text-xs text-gray-500">分类</label><Input value={ioNew.category} onChange={e => setIoNew({ ...ioNew, category: e.target.value })} className="mt-1" /></div>
                    <div><label className="text-xs text-gray-500">位置</label><Input value={ioNew.location} onChange={e => setIoNew({ ...ioNew, location: e.target.value })} placeholder="选填" className="mt-1" /></div>
                    <div><label className="text-xs text-gray-500">单位</label><Input value={ioNew.unit} onChange={e => setIoNew({ ...ioNew, unit: e.target.value })} placeholder="件" className="mt-1" /></div>
                    <div className="md:col-span-5 flex gap-2 items-center">
                      <span className="text-sm text-gray-400">填好名称即可创建，位置/分类可后续补</span>
                      <Button size="sm" onClick={createProductFromIo}>创建并选中</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIoNew(null)}>取消</Button>
                    </div>
                  </div>
                )}
              </div>
              <div><label className="text-xs text-gray-500 font-medium">当前商品图片</label>
                <div className="mt-1 h-16 w-16 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                  {sel?.image_url
                    ? <img src={sel.image_url} alt={sel.name} className="h-full w-full object-cover" onError={(e) => { const el = e.currentTarget; if (el) el.style.display = 'none' }} />
                    : <Package className="h-6 w-6 text-gray-300" />}
                </div>
              </div>
              <div><label className="text-xs text-gray-500 font-medium">类型</label>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant={ioForm.type === 'IN' ? 'default' : 'outline'} className="text-green-600" onClick={() => setIoForm({ ...ioForm, type: 'IN' })}><ArrowUpCircle className="h-4 w-4 mr-1" />入库</Button>
                  <Button size="sm" variant={ioForm.type === 'OUT' ? 'default' : 'outline'} className="text-red-600" onClick={() => setIoForm({ ...ioForm, type: 'OUT' })}><ArrowDownCircle className="h-4 w-4 mr-1" />出库</Button>
                </div>
              </div>
              <div><label className="text-xs text-gray-500 font-medium">数量 *</label>
                <Input type="number" min="0.01" step="0.01" value={ioForm.quantity} onChange={e => setIoForm({ ...ioForm, quantity: e.target.value })} placeholder="0" className="mt-1" />
              </div>
              <div><label className="text-xs text-gray-500 font-medium">业务时间（默认现在）</label>
                <Input type="datetime-local" value={ioForm.occur_at} onChange={e => setIoForm({ ...ioForm, occur_at: e.target.value })} className="mt-1" />
              </div>
              <div><label className="text-xs text-gray-500 font-medium">操作人</label>
                <Input value={ioForm.operator} onChange={e => setIoForm({ ...ioForm, operator: e.target.value })} placeholder="选填" className="mt-1" />
              </div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">备注</label>
                <Input value={ioForm.note} onChange={e => setIoForm({ ...ioForm, note: e.target.value })} placeholder="选填，如订单号/批次" className="mt-1" />
              </div>
            </div>
            <div className="mt-4"><Button onClick={submitIo}>提交</Button></div>
          </CardContent>
        </Card>
        )
      })()}

      {/* ===== Excel 导入 ===== */}
      {tab === 'import' && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-base font-semibold mb-1">Excel 智能导入</h3>
            <p className="text-sm text-gray-500 mb-3">上传 .xlsx，自动识别表头和图片，映射列后导入。重复商品会逐个确认。</p>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
                <input ref={rowImgRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0]; e.target.value = ''
                  if (!f || pendingImgRow == null) return
                  try {
                    const url = await compressImage(f)
                    setImportState(prev => prev ? { ...prev, images: { ...prev.images, [pendingImgRow]: url } } : prev)
                    setPendingImgRow(null)
                  } catch (err: any) { alert('图片处理失败：' + (err?.message || '')) }
                }} />
            <Button onClick={() => fileRef.current?.click()}><Upload className="mr-1.5 h-4 w-4" />选择 Excel 文件</Button>
            {importState && (
              <div className="mt-4 space-y-3">
                <div className="text-sm bg-blue-50 text-blue-700 rounded-lg p-3">
                  表头在第 <b>{importState.headerIdx + 1}</b> 行 · 列名：<b>{importState.headers.filter(Boolean).join(' | ')}</b> · 数据 {importState.rows.length} 条{Object.keys(importState.images).length ? ` · 自动带上图片 ${Object.keys(importState.images).length} 张` : ' · 未自动识别到图片（可逐行补图）'}
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {([
                    ['sku', 'SKU/编码'], ['name', '商品名称(必填)'], ['category', '分类'], ['owner', '主体'], ['location', '位置'], ['unit', '单位'], ['initial_stock', '初始库存'], ['image', '图片(链接/URL)'],
                  ] as const).map(([k, label]) => (
                    <div key={k}>
                      <label className="text-xs text-gray-500 font-medium">{label}</label>
                      <select value={mapping[k] || ''} onChange={e => setMapping({ ...mapping, [k]: e.target.value })} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
                        <option value="">（不导入）</option>
                        {importState.headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto border rounded-lg max-h-56 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead><tr>
                      <th className="text-left p-2 border-b bg-gray-50">图片</th>
                      {Object.entries(mapping).filter(([, v]) => v).map(([k]) => <th key={k} className="text-left p-2 border-b bg-gray-50">{k}</th>)}
                    </tr></thead>
                    <tbody>
                      {importState.rows.slice(0, 20).map((r, i) => {
                        const srcRow = importState.srcRows[i]
                        const emb = importState.images[srcRow]
                        const imgVal = emb || (mapping.image ? (r[mapping.image] || '') : '')
                        const showImg = emb || (imgVal && (imgVal.startsWith('http') || imgVal.startsWith('data:')))
                        return (
                          <tr key={i}>
                            <td className="p-2 border-b">
                              <div className="flex items-center gap-2">
                                {showImg
                                  ? <img src={showImg} alt="" className="w-10 h-10 object-cover rounded border" />
                                  : <span className="text-gray-300">—</span>}
                                <button className="text-[11px] text-blue-600 underline" onClick={() => { setPendingImgRow(srcRow); rowImgRef.current?.click() }}>{emb ? '重传' : '补图'}</button>
                              </div>
                            </td>
                            {Object.entries(mapping).filter(([, v]) => v).map(([k, v]) => (
                              <td key={k} className="p-2 border-b">
                                {k === 'image' && showImg
                                  ? <img src={showImg} alt="" className="w-10 h-10 object-cover rounded border" />
                                  : String(r[v] || '').slice(0, 40)}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <Button onClick={doImport}>导入到库存</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ===== 流水记录 ===== */}
      {tab === 'log' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 mb-3 flex-wrap items-center">
              <span className="text-sm font-semibold">流水记录</span>
              <select value={logFilter.type} onChange={e => setLogFilter({ ...logFilter, type: e.target.value })} className="text-sm border rounded-md px-2 py-1">
                <option value="">全部类型</option><option value="IN">入库</option><option value="OUT">出库</option>
              </select>
              <Input type="date" value={logFilter.from} onChange={e => setLogFilter({ ...logFilter, from: e.target.value })} className="w-40 text-sm" />
              <span className="text-gray-400">至</span>
              <Input type="date" value={logFilter.to} onChange={e => setLogFilter({ ...logFilter, to: e.target.value })} className="w-40 text-sm" />
              <Button variant="ghost" size="sm" onClick={() => setLogFilter({ type: '', from: '', to: '' })}><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3">时间</th><th className="py-2 pr-3">类型</th><th className="py-2 pr-3">SKU</th><th className="py-2 pr-3">商品</th><th className="py-2 pr-3">数量</th><th className="py-2 pr-3">单位</th><th className="py-2 pr-3">操作人</th><th className="py-2">备注</th>
                </tr></thead>
                <tbody>
                  {logList.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">暂无流水</td></tr>}
                  {logList.map(t => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-3">{new Date(t.occur_at).toLocaleString('zh-CN')}</td>
                      <td className="py-2 pr-3"><Badge variant={t.type === 'IN' ? 'secondary' : 'destructive'}>{t.type === 'IN' ? '入库' : '出库'}</Badge></td>
                      <td className="py-2 pr-3">{t.sku || '—'}</td>
                      <td className="py-2 pr-3">{t.name}</td>
                      <td className={`py-2 pr-3 font-semibold ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'IN' ? '+' : '-'}{fmt(t.quantity)}</td>
                      <td className="py-2 pr-3">{t.unit}</td>
                      <td className="py-2 pr-3">{t.operator || '—'}</td>
                      <td className="py-2">{t.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== 商品表单弹窗 ===== */}
      {form && <ProductForm product={form.p} ownerList={ownerList} locationList={locationList} onLocationsChange={(l) => setLocDict(l)} onCancel={() => setForm(null)} onSave={(data) => saveProduct(data, form.p?.id)} />}

      {/* ===== 位置字典管理弹窗 ===== */}
      {locMgr && <LocMgrModal list={locDict.length ? locDict : products.map(p => cleanStr(p.location)).filter(Boolean)} products={products} onCancel={() => setLocMgr(false)} onSave={(l) => { setLocDict(l); setLocMgr(false); toast(`位置字典已保存（${l.length} 个）`) }} />}

      {/* ===== 批量编辑弹窗（主体/分类/位置/单位/图片） ===== */}
      {batchEdit && (
        <BatchEditModal
          ids={batchEdit.ids}
          ownerList={ownerList}
          locationList={locationList}
          onCancel={() => setBatchEdit(null)}
          onOk={(patch) => {
            setProducts(products.map(p => batchEdit.ids.includes(p.id) ? { ...p, ...patch } : p))
            // 同步把新位置加到字典
            if (patch.location && cleanStr(patch.location) && !locationList.includes(patch.location)) {
              const nv = cleanStr(patch.location)
              setLocDict([...locationList, nv].sort((a, b) => a.localeCompare(b, 'zh')))
            }
            setSelIds(new Set()); setBatchEdit(null); toast(`已更新 ${batchEdit.ids.length} 个商品`)
          }}
        />
      )}

      {/* ===== 重复确认弹窗 ===== */}
      {confirmStep === 'dup' && (
        <Modal title={`发现 ${dupRows.length} 个重复商品`} onClose={() => setConfirmStep(null)}>
          <p className="text-sm text-gray-500 mb-2">已在库存里（按 SKU/名称判断）。逐个选择：跳过=不加；仍导入=再新增一条。</p>
          <div className="max-h-72 overflow-y-auto">
            {dupRows.map((r, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-dashed">
                <span className="flex-1 text-sm truncate">{r.name}{r.sku ? <span className="text-gray-400"> ({r.sku})</span> : ''}</span>
                <Button size="sm" variant="ghost" onClick={() => { const s = new Set(dupKeep); s.delete(r); setDupKeep(s) }} style={{ opacity: dupKeep.has(r) ? 0.5 : 1 }}>跳过</Button>
                <Button size="sm" onClick={() => { const s = new Set(dupKeep); s.add(r); setDupKeep(s) }} style={{ opacity: dupKeep.has(r) ? 1 : 0.5 }}>仍导入</Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmStep(null)}>取消</Button>
            <Button onClick={finishDup}>确定</Button>
          </div>
        </Modal>
      )}

      {/* ===== 主体确认弹窗 ===== */}
      {confirmStep === 'owner' && (
        <Modal title={`确认每个商品的主体（${ownerRows.length} 个）`} onClose={() => setConfirmStep(null)}>
          <div className="mb-2">
            <label className="text-xs text-gray-500 font-medium">统一设置主体（选一次全填，之后可单个改）</label>
            <select value={ownerAll} onChange={e => { setOwnerAll(e.target.value); if (e.target.value) { const m: Record<string, string> = {}; ownerRows.forEach(r => { m[r.name] = e.target.value }); setOwnerMap(m) } else setOwnerMap({}) }} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
              <option value="">（不统一设置）</option>
              {ownerList.map(o => <option key={o} value={o}>{o}</option>)}
              <option value="__new__">＋ 新建主体…</option>
            </select>
            {ownerAll === '__new__' && <Input placeholder="输入新主体名称，如：拼多多店" className="mt-2" onChange={e => { const m: Record<string, string> = {}; ownerRows.forEach(r => { m[r.name] = cleanStr(e.target.value) }); setOwnerMap(m) }} />}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {ownerRows.map((r, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-dashed">
                <span className="flex-1 text-sm truncate">{r.name}{r.sku ? <span className="text-gray-400"> ({r.sku})</span> : ''}</span>
                <select value={ownerMap[r.name] || ''} onChange={e => setOwnerMap({ ...ownerMap, [r.name]: e.target.value })} className="text-sm border rounded-md px-2 py-1 max-w-[160px]">
                  <option value="">（不填）</option>
                  {ownerList.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmStep(null)}>取消</Button>
            <Button onClick={finishOwner}>确认导入</Button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toastMsg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm shadow-lg z-[100]">{toastMsg}</div>}
    </div>
  )
}

/* ========== 商品表单 ========== */
function ProductForm({ product, ownerList, locationList, onCancel, onSave, onLocationsChange }: {
  product?: Product; ownerList: string[]; locationList: string[]; onCancel: () => void; onSave: (d: Omit<Product, 'id' | 'created_at'>) => void; onLocationsChange?: (l: string[]) => void
}) {
  const [f, setF] = useState({
    name: product?.name || '', sku: product?.sku || '', owner: product?.owner || '', location: product?.location || '',
    category: product?.category || '', unit: product?.unit || '件', initial_stock: product ? '' : '0', image_url: product?.image_url || '',
  })
  const [newOwner, setNewOwner] = useState('')
  const [newLoc, setNewLoc] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)
  const [imgBroken, setImgBroken] = useState(false)

  const pickImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    try {
      // 第一张作为主图，其余继续追加到本商品（这里先只保留主图，未来可扩展为多图）
      const main = await compressImage(files[0])
      setImgBroken(false)
      setF({ ...f, image_url: main })
    } catch (err: any) { alert('图片处理失败：' + (err?.message || '')) }
  }

  // 兜底：如果 image_url 不是 http(s):// 也不是 data:image/... 当成无效
  const cleanImageUrl = (s: string) => {
    const v = cleanStr(s)
    if (!v) return ''
    if (/^https?:\/\//i.test(v)) return v
    if (/^data:image\//i.test(v)) return v
    return ''
  }

  const save = () => {
    if (!cleanStr(f.name)) { alert('请填写商品名称'); return }
    let owner = cleanStr(f.owner)
    if (owner === '__new__') owner = cleanStr(newOwner)
    let location = cleanStr(f.location)
    if (location === '__new__') location = cleanStr(newLoc)
    // 落到字典
    if (onLocationsChange && location && !locationList.includes(location)) onLocationsChange([...locationList, location].sort((a, b) => a.localeCompare(b, 'zh')))
    onSave({
      name: cleanStr(f.name), sku: cleanStr(f.sku), owner, location,
      category: cleanStr(f.category), unit: cleanStr(f.unit) || '件',
      initial_stock: num(f.initial_stock), low_threshold: null, image_url: cleanImageUrl(f.image_url),
    })
  }

  return (
    <Modal title={product ? '编辑商品' : '新增商品'} onClose={onCancel}>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">商品名称 *</label>
          <Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="必填" className="mt-1" /></div>
        <div><label className="text-xs text-gray-500 font-medium">SKU</label>
          <Input value={f.sku} onChange={e => setF({ ...f, sku: e.target.value })} className="mt-1" /></div>
        <div><label className="text-xs text-gray-500 font-medium">主体（谁的产品）</label>
          <select value={f.owner} onChange={e => setF({ ...f, owner: e.target.value })} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
            <option value="">（不填）</option>
            {ownerList.map(o => <option key={o} value={o}>{o}</option>)}
            <option value="__new__">＋ 新建主体…</option>
          </select></div>
        {f.owner === '__new__' && <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">新主体名称</label>
          <Input value={newOwner} onChange={e => setNewOwner(e.target.value)} placeholder="如：拼多多店 / TikTok店 / 1688店" className="mt-1" /></div>}
        <div><label className="text-xs text-gray-500 font-medium">位置（仓库/货架，从字典选）</label>
          <select value={f.location} onChange={e => setF({ ...f, location: e.target.value })} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
            <option value="">（不填）</option>
            {locationList.map(l => <option key={l} value={l}>{l}</option>)}
            <option value="__new__">＋ 新建位置…</option>
          </select></div>
        {f.location === '__new__' && <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">新位置名称</label>
          <Input value={newLoc} onChange={e => setNewLoc(e.target.value)} placeholder="如：A区-1排-3层 / z1" className="mt-1" /></div>}
        <div><label className="text-xs text-gray-500 font-medium">分类</label>
          <Input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className="mt-1" /></div>
        <div><label className="text-xs text-gray-500 font-medium">单位</label>
          <Input value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} className="mt-1" /></div>
        {!product && <div><label className="text-xs text-gray-500 font-medium">初始库存</label>
          <Input type="number" value={f.initial_stock} onChange={e => setF({ ...f, initial_stock: e.target.value })} className="mt-1" /></div>}
        <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">商品图片</label>
          <div className="flex items-center gap-3 mt-1">
            {f.image_url && !imgBroken ? <img src={f.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border" onError={() => setImgBroken(true)} /> : <div className="w-16 h-16 rounded-lg border border-dashed flex items-center justify-center text-gray-300" title={imgBroken ? '图片加载失败，请重新上传' : ''}><Package className="h-6 w-6" /></div>}
            <input ref={imgRef} type="file" accept="image/*" onChange={pickImg} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => imgRef.current?.click()}><ImagePlus className="mr-1 h-4 w-4" />上传图片</Button>
            {f.image_url && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setF({ ...f, image_url: '' }); setImgBroken(false) }}>删除</Button>}
          </div></div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button onClick={save}>{product ? '保存修改' : '添加商品'}</Button>
      </div>
    </Modal>
  )
}

/* ========== 位置字典管理 ========== */
function LocMgrModal({ list, onCancel, onSave, products }: { list: string[]; onCancel: () => void; onSave: (l: string[]) => void; products: Product[] }) {
  const [draft, setDraft] = useState(list)
  const [newItem, setNewItem] = useState('')
  const usedCount = useMemo(() => {
    const m: Record<string, number> = {}
    products.forEach(p => { const l = cleanStr(p.location); if (l) m[l] = (m[l] || 0) + 1 })
    return m
  }, [products])
  const rename = (idx: number, v: string) => { const next = [...draft]; next[idx] = v; setDraft(next) }
  const remove = (idx: number) => { const next = [...draft]; next.splice(idx, 1); setDraft(next) }
  const add = () => { const v = cleanStr(newItem); if (!v) return; if (draft.includes(v)) return; setDraft([...draft, v]); setNewItem('') }
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-start justify-center p-6 overflow-y-auto" onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-5 my-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">位置字典（货架/仓位）</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-3">这里的位置会出现在「新增/编辑商品」和「批量编辑」的下拉里。新增商品时选了「新建…」也会自动加到字典。</p>
        <div className="flex gap-2 mb-3">
          <Input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }} placeholder="如：A区-1排-3层 / z1" className="flex-1" />
          <Button onClick={add}>添加</Button>
        </div>
        <div className="max-h-72 overflow-y-auto border rounded-lg">
          {draft.length === 0 && <div className="p-4 text-sm text-gray-400 text-center">暂无位置</div>}
          {draft.map((l, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0">
              <Input value={l} onChange={e => rename(i, e.target.value)} className="flex-1 h-8 text-sm" />
              <span className="text-xs text-gray-400 whitespace-nowrap">被 {usedCount[l] || 0} 个商品使用</span>
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(i)}>删除</Button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={() => onSave(draft.map(cleanStr).filter(Boolean))}>保存</Button>
        </div>
      </div>
    </div>
  )
}

/* ========== 批量编辑（商品多字段） ========== */
function BatchEditModal({ ids, ownerList, locationList, onCancel, onOk }: { ids: string[]; ownerList: string[]; locationList: string[]; onCancel: () => void; onOk: (patch: Partial<Product>) => void }) {
  const [fields, setFields] = useState<{ owner?: string; category?: string; location?: string; unit?: string; image_url?: string }>({})
  const [newOwner, setNewOwner] = useState('')
  const [newLoc, setNewLoc] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)
  const setF = (k: keyof typeof fields, v: string) => setFields(prev => ({ ...prev, [k]: v }))

  const pickImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; e.target.value = ''
    try { setF('image_url', await compressImage(f)) } catch (err: any) { alert('图片处理失败：' + (err?.message || '')) }
  }

  return (
    <Modal title={`批量编辑（${ids.length} 个商品）`} onClose={onCancel}>
      <p className="text-sm text-gray-500 mb-3">每个字段留空 = 不修改。只有填了的字段才会被更新。</p>
      <div className="grid md:grid-cols-2 gap-3">
        <div><label className="text-xs text-gray-500 font-medium">主体</label>
          <select value={fields.owner ?? ''} onChange={e => setF('owner', e.target.value)} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
            <option value="">（不修改）</option>
            {ownerList.map(o => <option key={o} value={o}>{o}</option>)}
            <option value="__new__">＋ 新建主体…</option>
          </select>
          {fields.owner === '__new__' && <Input value={newOwner} onChange={e => { setNewOwner(e.target.value); setF('owner', e.target.value) }} placeholder="新主体" className="mt-2" />}
        </div>
        <div><label className="text-xs text-gray-500 font-medium">分类</label>
          <Input value={fields.category ?? ''} onChange={e => setF('category', e.target.value)} placeholder="（不修改）" className="mt-1" /></div>
        <div><label className="text-xs text-gray-500 font-medium">位置</label>
          <select value={fields.location ?? ''} onChange={e => setF('location', e.target.value)} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
            <option value="">（不修改）</option>
            {locationList.map(l => <option key={l} value={l}>{l}</option>)}
            <option value="__new__">＋ 新建位置…</option>
          </select>
          {fields.location === '__new__' && <Input value={newLoc} onChange={e => { setNewLoc(e.target.value); setF('location', e.target.value) }} placeholder="新位置" className="mt-2" />}
        </div>
        <div><label className="text-xs text-gray-500 font-medium">单位</label>
          <Input value={fields.unit ?? ''} onChange={e => setF('unit', e.target.value)} placeholder="（不修改）" className="mt-1" /></div>
        <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">统一图片</label>
          <div className="flex items-center gap-3 mt-1">
            {fields.image_url ? <img src={fields.image_url} alt="" className="w-14 h-14 object-cover rounded-lg border" onError={(e) => { const el = e.currentTarget; if (el) { el.style.display = 'none'; const sib = el.nextElementSibling as HTMLElement | null; if (sib) sib.style.display = 'flex' } }} /> : <div className="w-14 h-14 rounded-lg border border-dashed flex items-center justify-center text-gray-300"><Package className="h-5 w-5" /></div>}
            <div className="w-14 h-14 rounded-lg border border-dashed hidden items-center justify-center text-gray-300"><Package className="h-5 w-5" /></div>
            <input ref={imgRef} type="file" accept="image/*" onChange={pickImg} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => imgRef.current?.click()}><ImagePlus className="mr-1 h-4 w-4" />上传</Button>
            {fields.image_url && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setF('image_url', '')}>清除</Button>}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button onClick={() => {
          const patch: any = {}
          if (fields.owner != null && cleanStr(fields.owner)) patch.owner = cleanStr(fields.owner)
          if (fields.category != null && cleanStr(fields.category)) patch.category = cleanStr(fields.category)
          if (fields.location != null && cleanStr(fields.location)) patch.location = cleanStr(fields.location)
          if (fields.unit != null && cleanStr(fields.unit)) patch.unit = cleanStr(fields.unit)
          if (fields.image_url) patch.image_url = fields.image_url
          if (Object.keys(patch).length === 0) { alert('没填要修改的字段'); return }
          onOk(patch)
        }}>应用</Button>
      </div>
    </Modal>
  )
}

/* ========== 通用弹窗 ========== */
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-start justify-center p-6 overflow-y-auto" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 my-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
