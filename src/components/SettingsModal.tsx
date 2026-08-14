import { useState, useEffect } from 'react'
import { X, KeyRound, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  GITEE_OWNER,
  GITEE_REPO,
  GITEE_BRANCH,
  setToken,
} from '@/lib/cloudConfig'

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [token, setTokenInput] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      // 默认不预填内置令牌；仅在用户想「改用别的令牌」时才粘贴
      setTokenInput('')
      setSaved(false)
    }
  }, [open])

  if (!open) return null

  const handleSave = () => {
    setToken(token)
    setSaved(true)
    // 重新加载，让各页面以新 Token 重新初始化云端同步
    setTimeout(() => window.location.reload(), 600)
  }

  const handleClear = () => {
    setToken('')
    setTokenInput('')
    setSaved(true)
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> 云端同步设置
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-800">云端仓库</p>
            <p>
              {GITEE_OWNER} / {GITEE_REPO}（分支 {GITEE_BRANCH}）
            </p>
            <p className="text-xs">
              数据存放于此仓库的 <code>data/</code> 目录，所有设备共享同一份。
            </p>
          </div>

          <div>
            <div className="mb-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              ✅ 云端已自动连接：直接打开网站就会自动同步，你无需填写任何内容。
            </div>
            <label className="block text-sm font-medium mb-1">云端访问令牌（可选，一般不用动）</label>
            <Input
              type="password"
              placeholder="仅在想改用其他令牌时才粘贴"
              value={token}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              网站已内置你之前的 Token，打开即自动同步。只有当你想换一个令牌时才需要填这里；
              填了之后只保存在你这台设备的浏览器里。
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-800">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              提示：Token 拥有本仓库的写入权。若你把网站分享给同事，把同一个 Token 发给他们填进设置即可共享；
              想要更安全可到 Gitee 生成一个仅限本仓库的细粒度令牌。
            </span>
          </div>

          {saved && (
            <p className="text-sm text-green-600">已保存，正在重新加载以启用同步...</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} className="flex-1">
              保存并启用云同步
            </Button>
            <Button variant="outline" onClick={handleClear}>
              清除
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
