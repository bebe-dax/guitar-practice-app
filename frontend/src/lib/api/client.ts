const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// XSRF-TOKEN Cookieは、認証チェック等の先行GETが完了する前に更新系リクエストが
// 発生すると未セットのままになりうる（タイミング依存のレースコンディション）。
// 無ければ軽いGETで先に取得してから読み直すことで、確実に存在させる。
async function ensureXsrfToken(): Promise<string | null> {
  const existing = getCookie('XSRF-TOKEN')
  if (existing) return existing

  await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
  return getCookie('XSRF-TOKEN')
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

// バックエンドAPI共通のfetchラッパー。
// - 常に credentials: 'include' でJWTのhttpOnly Cookieを送受信する
// - 更新系メソッドは XSRF-TOKEN Cookie を読み X-XSRF-TOKEN ヘッダーに載せる（Double Submit Cookie）
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = {}

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (method !== 'GET') {
    const xsrfToken = await ensureXsrfToken()
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new ApiError(response.status, problem?.detail ?? 'リクエストに失敗しました')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
