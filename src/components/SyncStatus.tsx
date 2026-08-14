import { Loader2, Cloud, Save } from 'lucide-react'

export function SyncStatus({
  syncing,
  cloudActive,
}: {
  syncing: boolean
  cloudActive: boolean
}) {
  if (syncing) {
    return (
      <span className="flex items-center text-blue-600">
        <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 正在同步云端...
      </span>
    )
  }
  if (cloudActive) {
    return (
      <span className="flex items-center text-green-600">
        <Cloud className="h-4 w-4 mr-1" /> 已同步云端（手机 / 同事实时共享）
      </span>
    )
  }
  return (
    <span className="flex items-center text-amber-600">
      <Save className="h-4 w-4 mr-1" /> 已存本机（设置里填 Token 可开启云同步）
    </span>
  )
}
