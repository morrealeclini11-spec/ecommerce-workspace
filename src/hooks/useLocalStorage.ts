import { useState, useEffect } from 'react'

// 通用本地存储 hook：首次读取本地数据，之后每次变更自动写回 localStorage。
// 不依赖任何网络，国内/手机/离线都能用。
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw) as T
    } catch {
      // 解析失败时回退到默认值
    }
    return initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 存储不可用（隐私模式/已满）时静默忽略
    }
  }, [key, value])

  return [value, setValue] as const
}
