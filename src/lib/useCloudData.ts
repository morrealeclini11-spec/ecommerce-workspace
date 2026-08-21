import { useState, useEffect } from 'react'
import { cloudLoad, cloudSave } from './cloud'
import type { CloudResult } from './cloud'
import { cloudEnabled } from './cloudConfig'

// 合并：云端优先，保留本地独有项（按 id），字符串数组取并集去重
function mergeArrays(local: unknown[], cloud: unknown[]): unknown[] {
  const isObj = (a: unknown[]) => a.length > 0 && typeof a[0] === 'object' && a[0] !== null
  if (isObj(local) && isObj(cloud)) {
    const cloudIds = new Set((cloud as any[]).map((x: any) => x?.id))
    const localOnly = (local as any[]).filter((x: any) => x?.id != null && !cloudIds.has(x?.id))
    return [...(cloud as any[]), ...localOnly]
  }
  return Array.from(new Set([...(cloud as any[]), ...(local as any[])]))
}

// 统一数据 hook：
// - 立即从本机读取（界面秒开、离线可用）
// - 若已配置云端令牌（内置 Token 已默认开启），则从云端拉取最新数据
//   - mergeOnLoad=true：云端与本地合并（云端优先、保留本地独有项），避免「云端空值覆盖本地」导致数据丢失，并自动把本地数据上传云端
//   - 否则：云端直接覆盖本机（适用于新闻/趋势这类只由后台写入、不本地编辑的数据）
// - 任何改动都写回本机 + 云端
export function useCloudData<T>(
  key: string,
  initial: T,
  opts?: { mergeOnLoad?: boolean }
): [T, (updater: T | ((prev: T) => T)) => void, boolean, boolean] {
  const [data, setData] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw) as T
    } catch {
      // ignore
    }
    return initial
  })
  const [syncing, setSyncing] = useState(false)
  const [cloudActive, setCloudActive] = useState(false)

  useEffect(() => {
    if (!cloudEnabled()) return
    let cancelled = false
    setSyncing(true)
    setCloudActive(true)
    cloudLoad(key).then((res: CloudResult) => {
      if (cancelled) return
      if (res.status === 'ok') {
        let next: T = res.data as T
        if (opts?.mergeOnLoad) {
          // 合并云端与本地：云端优先、保留本地独有，并把合并结果回写云端（上传本地数据）
          next = mergeArrays(data as unknown[], res.data as unknown[]) as T
          void cloudSave(key, next as unknown[])
        }
        setData(next)
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // ignore
        }
      } else if (res.status === 'missing') {
        // 首次：把当前本机数据推上去作为云端种子
        void cloudSave(key, (data as unknown[]) ?? (initial as unknown[]))
      }
      setSyncing(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = (updater: T | ((prev: T) => T)) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // ignore
      }
      if (cloudEnabled()) {
        setSyncing(true)
        cloudSave(key, next as unknown[]).finally(() => setSyncing(false))
      }
      return next
    })
  }

  return [data, update, syncing, cloudActive]
}
