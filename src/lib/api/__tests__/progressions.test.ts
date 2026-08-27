import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Timestamp } from 'firebase/firestore'
import { listProgressions, createProgression, updateProgression, deleteProgression } from '../progressions'

const mockAddDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockGetDocs = vi.fn()
const mockGetDocFromServer = vi.fn()

vi.mock('@/lib/firebase/client', () => ({
  firestore: {},
  firebaseAuth: { currentUser: { uid: 'user-1' } },
}))

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore')
  return {
    ...actual,
    collection: vi.fn((_db, name) => ({ path: name })),
    doc: vi.fn((_db, name, id) => ({ path: `${name}/${id}`, id })),
    query: vi.fn((...args) => args),
    where: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
    addDoc: (...args: unknown[]) => mockAddDoc(...args),
    updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
    deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
    getDocFromServer: (...args: unknown[]) => mockGetDocFromServer(...args),
  }
})

const input = {
  title: '王道進行',
  key: 'C' as const,
  scale: 'major' as const,
  chords: ['Am7', 'Dm7', 'G7'],
  memo: 'テストメモ',
}

const timestamp = Timestamp.fromDate(new Date('2026-08-17T00:00:00.000Z'))

describe('progressions APIクライアント(Firestore)', () => {
  beforeEach(() => {
    mockAddDoc.mockReset()
    mockUpdateDoc.mockReset()
    mockDeleteDoc.mockReset()
    mockGetDocs.mockReset()
    mockGetDocFromServer.mockReset()
  })

  it('listProgressions はログインユーザーのコード進行一覧を返す', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ ...input, createdAt: timestamp, updatedAt: timestamp }) },
      ],
    })

    const result = await listProgressions()

    expect(result).toEqual([
      { id: '1', ...input, createdAt: timestamp.toDate().toISOString(), updatedAt: timestamp.toDate().toISOString() },
    ])
  })

  it('listProgressions は不正な形式のドキュメントをスキップし、正常なものだけ返す', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'ok', data: () => ({ ...input, createdAt: timestamp, updatedAt: timestamp }) },
        // createdAtが文字列（Timestampではない）の不正なドキュメント
        { id: 'broken', data: () => ({ ...input, createdAt: '2026-01-01', updatedAt: timestamp }) },
      ],
    })

    const result = await listProgressions()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ok')
  })

  it('createProgression はuserIdを付与して作成し、作成結果を返す', async () => {
    mockAddDoc.mockResolvedValue({ id: 'new-1' })
    mockGetDocFromServer.mockResolvedValue({
      id: 'new-1',
      data: () => ({ ...input, userId: 'user-1', createdAt: timestamp, updatedAt: timestamp }),
    })

    const result = await createProgression(input)

    expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ ...input, userId: 'user-1' }))
    expect(result.id).toBe('new-1')
  })

  it('updateProgression は指定IDのドキュメントを更新し、更新結果を返す', async () => {
    mockUpdateDoc.mockResolvedValue(undefined)
    mockGetDocFromServer.mockResolvedValue({
      id: 'abc-123',
      data: () => ({ ...input, createdAt: timestamp, updatedAt: timestamp }),
    })

    const result = await updateProgression('abc-123', input)

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'abc-123' }),
      expect.objectContaining(input),
    )
    expect(result.id).toBe('abc-123')
  })

  it('deleteProgression は指定IDのドキュメントを削除する', async () => {
    mockDeleteDoc.mockResolvedValue(undefined)

    await deleteProgression('abc-123')

    expect(mockDeleteDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc-123' }))
  })
})
