import { useState, useEffect } from 'react'
import type { Progression } from '@/types/progression'

const STORAGE_KEY = 'guitar-app:progressions'

type StorageSchema = {
  version: 1
  progressions: Progression[]
}

function loadFromStorage(): Progression[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const schema = JSON.parse(raw) as StorageSchema
    if (schema.version !== 1) return []
    return schema.progressions
  } catch {
    return []
  }
}

function persistToStorage(progressions: Progression[]): void {
  const schema: StorageSchema = { version: 1, progressions }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schema))
}

export function useProgressions() {
  const [progressions, setProgressions] = useState<Progression[]>([])

  useEffect(() => {
    setProgressions(loadFromStorage())
  }, [])

  function save(data: Omit<Progression, 'id' | 'createdAt' | 'updatedAt'>): Progression {
    const now = new Date().toISOString()
    const progression: Progression = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    setProgressions(prev => {
      const next = [...prev, progression]
      persistToStorage(next)
      return next
    })
    return progression
  }

  function remove(id: string): void {
    setProgressions(prev => {
      const next = prev.filter(p => p.id !== id)
      persistToStorage(next)
      return next
    })
  }

  function update(id: string, patch: Partial<Omit<Progression, 'id' | 'createdAt'>>): void {
    setProgressions(prev => {
      const next = prev.map(p =>
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
      )
      persistToStorage(next)
      return next
    })
  }

  return { progressions, save, remove, update }
}
