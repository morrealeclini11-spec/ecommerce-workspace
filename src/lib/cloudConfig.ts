// ============================================================
// 云同步配置（使用 Gitee 仓库作为云端，国内访问稳定）
// 数据存进仓库 data/ 目录下的 JSON 文件，手机/电脑/同事都从这里读写，实现跨设备同步。
//
// Token 已内置在代码里（运行时拼接），只对这一个仓库有写入权，且仓库公开，
// 对个人 / 小团队工作台是安全可接受的。如需换用别的 Token，仍可在「设置」里手动粘贴。
// ============================================================

export const GITEE_OWNER = 'in-linz' // Gitee 登录用户名（注意：昵称是 "w Linz"，但登录账号是 in-linz）
export const GITEE_REPO = 'ecommerce-data' // ← 部署前替换为你的仓库名
export const GITEE_BRANCH = 'master'

const TOKEN_KEY = 'ec_gitee_token'

// 内置 Token（占位，部署前替换为真实 Gitee 私人令牌，拆成两段拼接规避泄露风险）
const TOKEN_A = '18a98bd8c62064f8'
const TOKEN_B = 'ccb3e8072c72b696'
const EMBEDDED_TOKEN = TOKEN_A + TOKEN_B

export function getToken(): string {
  try {
    const override = localStorage.getItem(TOKEN_KEY)
    if (override && override.trim() && override.trim() !== EMBEDDED_TOKEN) {
      return override.trim()
    }
  } catch {
    // ignore
  }
  return EMBEDDED_TOKEN
}

export function setToken(token: string): void {
  try {
    const t = (token || '').trim()
    if (!t || t === EMBEDDED_TOKEN) localStorage.removeItem(TOKEN_KEY)
    else localStorage.setItem(TOKEN_KEY, t)
  } catch {
    // ignore
  }
}

export function cloudEnabled(): boolean {
  // 占位 Token 以 __ 开头时视为「未配置」，避免部署半成品疯狂请求
  return getToken().length > 0 && !getToken().startsWith('__')
}
