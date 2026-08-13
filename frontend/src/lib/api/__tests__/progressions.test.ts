import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch } from '../client'
import { listProgressions, createProgression, updateProgression, deleteProgression } from '../progressions'

vi.mock('../client', () => ({
  apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

const input = {
  title: '王道進行',
  key: 'C',
  scale: 'major' as const,
  chords: ['Am7', 'Dm7', 'G7'],
  memo: 'テストメモ',
}

describe('progressions APIクライアント', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
  })

  it('listProgressions は GET /api/progressions を呼ぶ', async () => {
    mockedApiFetch.mockResolvedValue([])

    await listProgressions()

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/progressions')
  })

  it('createProgression は POST /api/progressions にbodyを渡す', async () => {
    mockedApiFetch.mockResolvedValue({ id: '1', ...input, createdAt: '', updatedAt: '' })

    await createProgression(input)

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/progressions', { method: 'POST', body: input })
  })

  it('updateProgression は PUT /api/progressions/{id} にbodyを渡す', async () => {
    mockedApiFetch.mockResolvedValue({ id: 'abc-123', ...input, createdAt: '', updatedAt: '' })

    await updateProgression('abc-123', input)

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/progressions/abc-123', { method: 'PUT', body: input })
  })

  it('deleteProgression は DELETE /api/progressions/{id} を呼ぶ', async () => {
    mockedApiFetch.mockResolvedValue(undefined)

    await deleteProgression('abc-123')

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/progressions/abc-123', { method: 'DELETE' })
  })
})
