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
    const fetchMock = stubFetch({ ok: true, status: 200, body: [] })

    await apiFetch('/api/progressions')

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-XSRF-TOKEN']).toBeUndefined()
    expect(init.credentials).toBe('include')
  })

  it('POSTリクエストにはCookieのXSRF-TOKENをX-XSRF-TOKENヘッダーに載せる', async () => {
    stubDocumentCookie('other=1; XSRF-TOKEN=abc123; another=2')
    const fetchMock = stubFetch({ ok: true, status: 200, body: { id: '1' } })

    await apiFetch('/api/progressions', { method: 'POST', body: { title: 'test' } })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-XSRF-TOKEN']).toBe('abc123')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('XSRF-TOKEN Cookieが無い場合はヘッダーを付けない', async () => {
    stubDocumentCookie('')
    const fetchMock = stubFetch({ ok: true, status: 204 })

    await apiFetch('/api/progressions/1', { method: 'DELETE' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-XSRF-TOKEN']).toBeUndefined()
  })

  it('204レスポンスはundefinedを返す', async () => {
    stubDocumentCookie('')
    stubFetch({ ok: true, status: 204 })

    const result = await apiFetch('/api/progressions/1', { method: 'DELETE' })

    expect(result).toBeUndefined()
  })

  it('エラー時はProblemDetailのdetailを使ってApiErrorを投げる', async () => {
    stubDocumentCookie('')
    stubFetch({ ok: false, status: 409, body: { detail: 'タイトルは必須です' } })

    const promise = apiFetch('/api/progressions', { method: 'POST', body: {} })

    await expect(promise).rejects.toBeInstanceOf(ApiError)
    await expect(promise).rejects.toMatchObject({
      status: 409,
      message: 'タイトルは必須です',
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

    await expect(apiFetch('/api/progressions')).rejects.toMatchObject({
      status: 401,
      message: 'リクエストに失敗しました',
    })
  })
})
