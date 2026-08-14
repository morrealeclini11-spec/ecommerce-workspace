// 站点访问密码校验（SHA-256，避免明文直接出现在打包产物里）
// 修改密码：把新密码的 SHA-256 十六进制填到 ACCESS_PASSWORD_HASH；
//   生成命令（本地任意终端执行）：python -c "import hashlib;print(hashlib.sha256('你的新密码'.encode()).hexdigest())"
// 注意：正式部署为 https，走 SHA-256 校验；本地若用 http/file 打开（crypto.subtle 不可用），
// 才会降级到 PLAINTEXT_PASSWORD 明文比对，仅供调试。

// 默认密码 ecom2026 的 SHA-256
export const ACCESS_PASSWORD_HASH =
  'f87b6fc0b1173a2dc511b381c67a284995e2fa17040a017bd38e6fe01a453318'

// 仅本地 http 调试时使用，正式 https 部署不会用到此值。
export const PLAINTEXT_PASSWORD = 'ecom2026'

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(input: string): Promise<boolean> {
  const secure =
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof window.crypto?.subtle !== 'undefined'
  if (secure) {
    const buf = await window.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(input)
    )
    return toHex(buf) === ACCESS_PASSWORD_HASH
  }
  // 非安全上下文（本地调试）降级为明文比对
  return input === PLAINTEXT_PASSWORD
}

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem('ecom_unlocked') === '1'
  } catch {
    return false
  }
}

export function setUnlocked(): void {
  try {
    localStorage.setItem('ecom_unlocked', '1')
  } catch {
    /* ignore */
  }
}
