import { useState, useEffect, useCallback } from 'react'
import type { Progression } from '@/types/progression'
import { listProgressions, createProgression, updateProgression, deleteProgression } from '@/lib/api/progressions'

type ProgressionInput = Omit<Progression, 'id' | 'createdAt' | 'updatedAt'>

export function useProgressions() {
  const [progressions, setProgressions] = useState<Progression[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listProgressions()
      setProgressions(data)
    } catch {
      setError('コード進行の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function save(data: ProgressionInput): Promise<Progression> {
    const progression = await createProgression(data)
    setProgressions(prev => [progression, ...prev])
    return progression
  }

  async function remove(id: string): Promise<void> {
    await deleteProgression(id)
    setProgressions(prev => prev.filter(p => p.id !== id))
  }

  async function update(id: string, data: ProgressionInput): Promise<void> {
    const updated = await updateProgression(id, data)
    setProgressions(prev => prev.map(p => (p.id === id ? updated : p)))
  }

  return { progressions, loading, error, save, remove, update }
}
