import { useState, useEffect, useCallback } from 'react'
import type { ProgressionItem } from '@/types/progression'
import {
  listProgressions,
  createProgression,
  updateProgression,
  deleteProgression,
  type ProgressionItemInput,
} from '@/lib/api/progressions'

export function useProgressions() {
  const [progressions, setProgressions] = useState<ProgressionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listProgressions()
      setProgressions(data)
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function save(data: ProgressionItemInput): Promise<ProgressionItem> {
    const item = await createProgression(data)
    setProgressions(prev => [item, ...prev])
    return item
  }

  async function remove(id: string): Promise<void> {
    await deleteProgression(id)
    setProgressions(prev => prev.filter(p => p.id !== id))
  }

  async function update(id: string, data: ProgressionItemInput): Promise<void> {
    const updated = await updateProgression(id, data)
    setProgressions(prev => prev.map(p => (p.id === id ? updated : p)))
  }

  return { progressions, loading, error, save, remove, update }
}
