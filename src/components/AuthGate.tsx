import { useState } from 'react'
import { Lock } from 'lucide-react'
import { verifyPassword, isUnlocked, setUnlocked } from '@/lib/auth'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlockedState] = useState<boolean>(isUnlocked())
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const ok = await verifyPassword(pw)
    if (ok) {
      setUnlocked()
      setUnlockedState(true)
    } else {
      setErr('密码错误，请重试')
    }
    setLoading(false)
  }

  if (unlocked) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-5"
      >
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
            <Lock className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">跨境电商工作台</h1>
          <p className="text-sm text-gray-500 mt-1">请输入访问密码</p>
        </div>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="访问密码"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? '验证中…' : '进入工作台'}
        </button>
        <p className="text-xs text-gray-400 text-center">
          未授权人员即使拿到链接也无法查看任何内容
        </p>
      </form>
    </div>
  )
}
