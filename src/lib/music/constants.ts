import type { ScaleName } from '@/types/music'

// 標準チューニング（6弦 → 1弦）
export const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const

export const FRET_COUNT = 24
export const DEFAULT_FRET_START = 0
export const DEFAULT_FRET_WIDTH = 12
export const MAX_FRET_START = 12

// ポジションマーク（インレイ）の位置
export const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21] as const
export const DOUBLE_INLAYS = [12, 24] as const

export const SCALE_OPTIONS: { label: string; value: ScaleName }[] = [
  { label: 'Major',            value: 'major' },
  { label: 'Natural Minor',    value: 'minor' },
  { label: 'Major Pentatonic', value: 'major pentatonic' },
  { label: 'Minor Pentatonic', value: 'minor pentatonic' },
  { label: 'Blues',            value: 'blues' },
]
