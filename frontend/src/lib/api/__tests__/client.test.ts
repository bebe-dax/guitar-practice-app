import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiFetch, ApiError } from '../client'

function stubDocumentCookie(cookie: string) {
  vi.stubGlobal('document', { cookie })
}

function stubFetch(response: { ok: boolean; status: number; body?: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: async () => response.body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GETリクエストにはX-XSRF-TOKENヘッダーを付けない', async () => {
    stubDocumentCookie('XSRF-TOKEN=abc123')
    const fetchMock = stubFetch({ ok: true, status: 200, body: { id: '1', email: 'a@example.com' } })

    await apiFetch('/api/auth/me')

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-XSRF-TOKEN']).toBeUndefined()
    expect(init.credentials).toBe('include')
  })

  it('POSTリクエストにはCookieのXSRF-TOKENをX-XSRF-TOKENヘッダーに載せる', async () => {
    stubDocumentCookie('other=1; XSRF-TOKEN=abc123; another=2')
    const fetchMock = stubFetch({ ok: true, status: 200, body: { id: '1', email: 'a@example.com' } })

    await apiFetch('/api/auth/login', { method: 'POST', body: { email: 'a@example.com', password: 'x' } })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-XSRF-TOKEN']).toBe('abc123')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('XSRF-TOKEN Cookieが無ければヘッダーを付けない', async () => {
    stubDocumentCookie('')
    const fetchMock = stubFetch({ ok: true, status: 204 })

    await apiFetch('/api/auth/logout', { method: 'POST' })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-XSRF-TOKEN']).toBeUndefined()
  })

  it('204レスポンスはundefinedを返す', async () => {
    stubDocumentCookie('')
    stubFetch({ ok: true, status: 204 })

    const result = await apiFetch('/api/auth/logout', { method: 'POST' })

    expect(result).toBeUndefined()
  })

  it('エラー時はProblemDetailのdetailを使ってApiErrorを投げる', async () => {
    stubDocumentCookie('')
    stubFetch({ ok: false, status: 409, body: { detail: 'このメールアドレスは既に登録されています' } })

    const promise = apiFetch('/api/auth/register', { method: 'POST', body: {} })

    await expect(promise).rejects.toBeInstanceOf(ApiError)
    await expect(promise).rejects.toMatchObject({
      status: 409,
      message: 'このメールアドレスは既に登録されています',
    })
  })

  it('エラーボディが無い場合は既定のメッセージになる', async () => {
    stubDocumentCookie('')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => {
        throw new Error('empty body')
      },
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/api/auth/me')).rejects.toMatchObject({
      status: 401,
      message: 'リクエストに失敗しました',
    })
  })
})
