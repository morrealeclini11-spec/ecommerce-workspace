import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Plus, Trash2, Calendar, Sun, Moon, CheckCircle2, Circle, Pencil, X, Video,
} from 'lucide-react'
import { useCloudData } from '@/lib/useCloudData'
import { SyncStatus } from '@/components/SyncStatus'

interface VideoPlan {
  id: string
  date: string // YYYY-MM-DD
  session: 'AM' | 'PM'
  country: string
  product: string
  owner: string
  planned_count: number
  planned_time: string // HH:MM
  status: 'planned' | 'posted' | 'skipped'
  posted_count: number
  note: string
  created_at: string
}

const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const todayStr = () => new Date().toISOString().slice(0, 10)
const cleanStr = (v: any) => (v == null ? '' : String(v).trim())
const num = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

const SESSION = { AM: { label: '上午', icon: Sun, color: 'text-amber-600 bg-amber-50' }, PM: { label: '下午', icon: Moon, color: 'text-indigo-600 bg-indigo-50' } }
const COMMON_COUNTRIES = ['美国', '英国', '德国', '法国', '西班牙', '意大利', '日本', '韩国', '东南亚', '中东', '其他']
const COMMON_OWNERS = ['主体A', '主体B', '主体C']

export function VideoPlan() {
  const [plans, setPlans] = useCloudData<VideoPlan[]>('ec_video_plan_v1', [])
  const [syncing, cloudActive] = [false, false] as const

  const [tab, setTab] = useState<'list' | 'board'>('list')
  const [date, setDate] = useState(todayStr())
  const [filterOwner, setFilterOwner] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [editing, setEditing] = useState<{ mode: 'add' | 'edit'; p?: VideoPlan } | null>(null)
  const [toastMsg, setToastMsg] = useState('')
  const toast = (t: string) => { setToastMsg(t); setTimeout(() => setToastMsg(''), 1800) }

  // 字典：国家和主体（取已用 + 预置）
  const ownerList = useMemo(() => Array.from(new Set([...COMMON_OWNERS, ...plans.map(p => cleanStr(p.owner)).filter(Boolean)])).sort(), [plans])
  const countryList = useMemo(() => Array.from(new Set([...COMMON_COUNTRIES, ...plans.map(p => cleanStr(p.country)).filter(Boolean)])).sort((a, b) => a.localeCompare(b, 'zh')), [plans])

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1
      if (a.session !== b.session) return a.session === 'AM' ? -1 : 1
      return (a.planned_time || '').localeCompare(b.planned_time || '')
    })
  }, [plans])

  const filteredPlans = useMemo(() => {
    return sortedPlans.filter(p => {
      if (date && p.date !== date) return false
      if (filterOwner && p.owner !== filterOwner) return false
      if (filterCountry && p.country !== filterCountry) return false
      return true
    })
  }, [sortedPlans, date, filterOwner, filterCountry])

  // 汇总：今日计划/已发
  const summary = useMemo(() => {
    const td = todayStr()
    const todayPlans = plans.filter(p => p.date === td)
    return {
      todayPlanned: todayPlans.reduce((s, p) => s + num(p.planned_count), 0),
      todayPosted: todayPlans.reduce((s, p) => s + num(p.posted_count), 0),
      todayItems: todayPlans.length,
    }
  }, [plans])

  const savePlan = (data: Omit<VideoPlan, 'id' | 'created_at'>, id?: string) => {
    if (id) setPlans(plans.map(p => p.id === id ? { ...p, ...data } : p))
    else setPlans([{ id: uid('vp'), ...data, created_at: new Date().toISOString() }, ...plans])
    setEditing(null); toast('已保存')
  }
  const deletePlan = (id: string) => {
    if (!confirm('删除该视频计划？')) return
    setPlans(plans.filter(p => p.id !== id)); toast('已删除')
  }
  const toggleStatus = (p: VideoPlan) => {
    const nextStatus: VideoPlan['status'] = p.status === 'planned' ? 'posted' : p.status === 'posted' ? 'skipped' : 'planned'
    setPlans(plans.map(x => x.id === p.id ? { ...x, status: nextStatus, posted_count: nextStatus === 'posted' ? (x.posted_count || x.planned_count) : nextStatus === 'planned' ? x.posted_count : 0 } : x))
  }
  const setPostedCount = (p: VideoPlan, v: string) => setPlans(plans.map(x => x.id === p.id ? { ...x, posted_count: num(v) } : x))

  // 按上下午分组
  const amItems = filteredPlans.filter(p => p.session === 'AM')
  const pmItems = filteredPlans.filter(p => p.session === 'PM')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">每日视频规划</h2>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            <SyncStatus syncing={syncing} cloudActive={cloudActive} />
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setEditing({ mode: 'add' })}><Plus className="mr-1.5 h-4 w-4" />新增规划</Button>
        </div>
      </div>

      {/* 今日汇总 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-500">今日计划发布</div><div className="text-2xl font-bold mt-1 text-blue-600">{summary.todayPlanned} 条</div><div className="text-xs text-gray-400 mt-1">{summary.todayItems} 个规划项</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-500">今日实际发布</div><div className="text-2xl font-bold mt-1 text-green-600">{summary.todayPosted} 条</div><div className="text-xs text-gray-400 mt-1">{summary.todayPlanned ? Math.round(summary.todayPosted / summary.todayPlanned * 100) : 0}% 完成率</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-500">状态</div><div className="text-2xl font-bold mt-1">{summary.todayPlanned - summary.todayPosted > 0 ? <span className="text-orange-600">还差 {summary.todayPlanned - summary.todayPosted}</span> : <span className="text-green-600">已完成 ✓</span>}</div><div className="text-xs text-gray-400 mt-1">看完记得回到这里打卡</div></CardContent></Card>
      </div>

      {/* 筛选 + Tab */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40 text-sm" />
            <Button variant="ghost" size="sm" onClick={() => setDate(todayStr())}>今天</Button>
            <Button variant="ghost" size="sm" onClick={() => setDate('')}>全部</Button>
            <span className="text-gray-300">|</span>
            <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} className="text-sm border rounded-md px-2 py-1">
              <option value="">全部主体</option>
              {ownerList.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="text-sm border rounded-md px-2 py-1">
              <option value="">全部国家</option>
              {countryList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-1 border-b -mb-3">
            {[{ id: 'list', label: '列表视图' }, { id: 'board', label: '上午/下午看板' }].map(n => (
              <button key={n.id} onClick={() => setTab(n.id as any)} className={`px-4 py-2 text-sm font-semibold border-b-2 ${tab === n.id ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>{n.label}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 视图 */}
      {tab === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b bg-gray-50">
                    <th className="py-2 px-3">日期</th>
                    <th className="py-2 px-3">时段</th>
                    <th className="py-2 px-3">时间</th>
                    <th className="py-2 px-3">国家</th>
                    <th className="py-2 px-3">主体</th>
                    <th className="py-2 px-3">产品</th>
                    <th className="py-2 px-3">计划</th>
                    <th className="py-2 px-3">已发</th>
                    <th className="py-2 px-3">状态</th>
                    <th className="py-2 px-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-gray-400">还没有规划，点「+ 新增规划」开始</td></tr>}
                  {filteredPlans.map(p => {
                    const ss = SESSION[p.session]
                    const ratio = p.planned_count ? Math.round((p.posted_count / p.planned_count) * 100) : 0
                    return (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-mono text-xs">{p.date}</td>
                        <td className="py-2 px-3"><Badge variant="outline" className={ss.color}>{ss.label}</Badge></td>
                        <td className="py-2 px-3 font-mono">{p.planned_time || '—'}</td>
                        <td className="py-2 px-3">{p.country || <span className="text-gray-300">—</span>}</td>
                        <td className="py-2 px-3">{p.owner ? <Badge variant="secondary">{p.owner}</Badge> : <span className="text-gray-300">—</span>}</td>
                        <td className="py-2 px-3 font-medium">{p.product || <span className="text-gray-300">—</span>}</td>
                        <td className="py-2 px-3 text-blue-600 font-bold">{p.planned_count}</td>
                        <td className="py-2 px-3">
                          <Input type="number" min="0" value={p.posted_count} onChange={e => setPostedCount(p, e.target.value)} className="w-16 h-7 text-sm" />
                          {p.planned_count > 0 && <span className="ml-1 text-xs text-gray-400">{ratio}%</span>}
                        </td>
                        <td className="py-2 px-3">
                          <button onClick={() => toggleStatus(p)} title="点击切换状态" className="inline-flex items-center gap-1">
                            {p.status === 'planned' && <><Circle className="h-4 w-4 text-gray-400" /><span className="text-xs">待发</span></>}
                            {p.status === 'posted' && <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-xs text-green-600">已发</span></>}
                            {p.status === 'skipped' && <><X className="h-4 w-4 text-gray-300" /><span className="text-xs text-gray-400">跳过</span></>}
                          </button>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => setEditing({ mode: 'edit', p })}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deletePlan(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'board' && (
        <div className="grid md:grid-cols-2 gap-4">
          {(['AM', 'PM'] as const).map(s => {
            const ss = SESSION[s]
            const Icon = ss.icon
            const list = s === 'AM' ? amItems : pmItems
            const planned = list.reduce((sum, p) => sum + num(p.planned_count), 0)
            const posted = list.reduce((sum, p) => sum + num(p.posted_count), 0)
            return (
              <Card key={s}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${ss.color}`}>
                      <Icon className="h-4 w-4" /> {ss.label}
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      计划 {planned} 条 · 已发 <span className="text-green-600 font-bold">{posted}</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.length === 0 && <div className="text-sm text-gray-400 py-6 text-center">{ss.label}还没有规划</div>}
                  {list.map(p => {
                    const done = p.planned_count > 0 && p.posted_count >= p.planned_count
                    return (
                      <div key={p.id} className={`p-3 rounded-xl border ${done ? 'border-green-200 bg-green-50/40' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-gray-500">{p.planned_time || '—'}</span>
                            <Badge variant="outline">{p.country || '未指定国家'}</Badge>
                            {p.owner && <Badge variant="secondary">{p.owner}</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-600">{p.posted_count}/{p.planned_count}</span>
                            <button onClick={() => toggleStatus(p)}>{p.status === 'posted' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-gray-400" />}</button>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{p.product || <span className="text-gray-300">未指定产品</span>}</div>
                        {p.note && <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{p.note}</div>}
                        <div className="flex justify-end gap-1 mt-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditing({ mode: 'edit', p })}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deletePlan(p.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {editing && <PlanForm plan={editing.p} countryList={countryList} ownerList={ownerList} onCancel={() => setEditing(null)} onSave={(d, id) => savePlan(d, id)} />}

      {toastMsg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm shadow-lg z-[100]">{toastMsg}</div>}
    </div>
  )
}

function PlanForm({ plan, countryList, ownerList, onCancel, onSave }: {
  plan?: VideoPlan; countryList: string[]; ownerList: string[]; onCancel: () => void; onSave: (d: Omit<VideoPlan, 'id' | 'created_at'>, id?: string) => void
}) {
  const [f, setF] = useState({
    date: plan?.date || todayStr(),
    session: plan?.session || 'AM' as 'AM' | 'PM',
    country: plan?.country || '',
    owner: plan?.owner || '',
    product: plan?.product || '',
    planned_count: String(plan?.planned_count ?? 1),
    planned_time: plan?.planned_time || '',
    posted_count: String(plan?.posted_count ?? 0),
    status: plan?.status || 'planned' as VideoPlan['status'],
    note: plan?.note || '',
  })
  const [newCountry, setNewCountry] = useState('')
  const [newOwner, setNewOwner] = useState('')

  const save = () => {
    if (!cleanStr(f.product)) { alert('请填写产品'); return }
    const country = f.country === '__new__' ? cleanStr(newCountry) : f.country
    const owner = f.owner === '__new__' ? cleanStr(newOwner) : f.owner
    onSave({
      date: f.date || todayStr(),
      session: f.session,
      country, owner,
      product: cleanStr(f.product),
      planned_count: Math.max(0, num(f.planned_count)),
      planned_time: cleanStr(f.planned_time),
      posted_count: Math.max(0, num(f.posted_count)),
      status: f.status,
      note: cleanStr(f.note),
    }, plan?.id)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-start justify-center p-6 overflow-y-auto" onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 my-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold flex items-center gap-2"><Video className="h-4 w-4" />{plan ? '编辑规划' : '新增规划'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500 font-medium">日期</label>
            <Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className="mt-1" /></div>
          <div><label className="text-xs text-gray-500 font-medium">时段</label>
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant={f.session === 'AM' ? 'default' : 'outline'} onClick={() => setF({ ...f, session: 'AM' })}><Sun className="h-4 w-4 mr-1" />上午</Button>
              <Button size="sm" variant={f.session === 'PM' ? 'default' : 'outline'} onClick={() => setF({ ...f, session: 'PM' })}><Moon className="h-4 w-4 mr-1" />下午</Button>
            </div></div>
          <div><label className="text-xs text-gray-500 font-medium">时间点</label>
            <Input type="time" value={f.planned_time} onChange={e => setF({ ...f, planned_time: e.target.value })} className="mt-1" placeholder="如 10:30 / 14:00" /></div>
          <div><label className="text-xs text-gray-500 font-medium">主体</label>
            <select value={f.owner} onChange={e => setF({ ...f, owner: e.target.value })} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
              <option value="">（不填）</option>
              {ownerList.map(o => <option key={o} value={o}>{o}</option>)}
              <option value="__new__">＋ 新建主体…</option>
            </select>
            {f.owner === '__new__' && <Input value={newOwner} onChange={e => setNewOwner(e.target.value)} placeholder="如：拼多多店 / TikTok店" className="mt-2" />}
          </div>
          <div><label className="text-xs text-gray-500 font-medium">国家</label>
            <select value={f.country} onChange={e => setF({ ...f, country: e.target.value })} className="w-full mt-1 text-sm border rounded-md px-3 py-2">
              <option value="">（不填）</option>
              {countryList.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__new__">＋ 新建国家…</option>
            </select>
            {f.country === '__new__' && <Input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="如：美国 / 英国 / 印尼" className="mt-2" />}
          </div>
          <div><label className="text-xs text-gray-500 font-medium">计划发布数</label>
            <Input type="number" min="0" value={f.planned_count} onChange={e => setF({ ...f, planned_count: e.target.value })} className="mt-1" /></div>
          <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">产品 *</label>
            <Input value={f.product} onChange={e => setF({ ...f, product: e.target.value })} placeholder="比如：圣诞灯泡串 / 暖手宝充电款" className="mt-1" /></div>
          <div className="md:col-span-2"><label className="text-xs text-gray-500 font-medium">备注</label>
            <Textarea value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="比如：素材来自 XX 链接 / 投放预算 / 联动博主" rows={3} className="mt-1" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={save}>{plan ? '保存' : '添加'}</Button>
        </div>
      </div>
    </div>
  )
}
