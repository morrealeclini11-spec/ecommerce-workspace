import { useState, useEffect } from 'react'
import { cloudLoad, cloudSave } from './cloud'
import type { CloudResult } from './cloud'
import { cloudEnabled } from './cloudConfig'

// 统一数据 hook：
// - 立即从本机读取（界面秒开、离线可用）
// - 若已在「设置」里填入云端令牌，则从云端拉取最新数据覆盖本机（实现跨设备同步）
// - 任何改动都写回本机 + 云端
export function useCloudData<T>(
  key: string,
  initial: T
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
        setData(res.data as T)
        try {
          localStorage.setItem(key, JSON.stringify(res.data))
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
