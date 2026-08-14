import { GITEE_OWNER, GITEE_REPO, GITEE_BRANCH, getToken } from './cloudConfig'

export type CloudResult =
  | { status: 'ok'; data: unknown[] }
  | { status: 'missing' }
  | { status: 'error'; message: string }

const API = `https://gitee.com/api/v5/repos/${GITEE_OWNER}/${GITEE_REPO}/contents/data`

function b64encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}
function b64decode(b64: string): string {
  return decodeURIComponent(escape(atob(b64)))
}

// Gitee 用 access_token 作为 query 参数鉴权（私人令牌）
async function geeFetch(path: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const sep = path.includes('?') ? '&' : '?'
    const url = `${path}${sep}access_token=${encodeURIComponent(getToken())}`
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

export async function cloudLoad(key: string): Promise<CloudResult> {
  if (!getToken()) return { status: 'error', message: '未配置 Token' }
  try {
    const res = await geeFetch(`${API}/${key}.json?ref=${GITEE_BRANCH}`, { method: 'GET' })
    if (res.status === 404) return { status: 'missing' }
    if (!res.ok) return { status: 'error', message: `HTTP ${res.status}` }
    const json = await res.json()
    if (!json.content) return { status: 'missing' }
    const content = b64decode(json.content)
    return { status: 'ok', data: JSON.parse(content) as unknown[] }
  } catch (e: any) {
    return { status: 'error', message: e?.message || '网络错误' }
  }
}

export async function cloudSave(key: string, items: unknown[]): Promise<boolean> {
  if (!getToken()) return false
  const content = b64encode(JSON.stringify(items, null, 2))
  try {
    // 先取现有文件的 sha（更新需要）；404 表示首次创建
    let sha: string | undefined
    const head = await geeFetch(`${API}/${key}.json?ref=${GITEE_BRANCH}`, { method: 'GET' })
    if (head.ok) {
      const j = await head.json()
      sha = j.sha
    } else if (head.status !== 404) {
      return false
    }
    const body: Record<string, unknown> = {
      content,
      message: `sync ${key} via workspace`,
      branch: GITEE_BRANCH,
    }
    if (sha) body.sha = sha
    const res = await geeFetch(`${API}/${key}.json`, {
      // 文件已存在（带 sha）用 PUT 更新；首次创建用 POST
      method: sha ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    })
    return res.ok
  } catch {
    return false
  }
}
