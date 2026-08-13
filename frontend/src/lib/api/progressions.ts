import { apiFetch } from './client'
import type { Progression } from '@/types/progression'

type ProgressionInput = Omit<Progression, 'id' | 'createdAt' | 'updatedAt'>

export function listProgressions(): Promise<Progression[]> {
  return apiFetch<Progression[]>('/api/progressions')
}

export function createProgression(data: ProgressionInput): Promise<Progression> {
  return apiFetch<Progression>('/api/progressions', { method: 'POST', body: data })
}

export function updateProgression(id: string, data: ProgressionInput): Promise<Progression> {
  return apiFetch<Progression>(`/api/progressions/${id}`, { method: 'PUT', body: data })
}

export function deleteProgression(id: string): Promise<void> {
  return apiFetch<void>(`/api/progressions/${id}`, { method: 'DELETE' })
}
