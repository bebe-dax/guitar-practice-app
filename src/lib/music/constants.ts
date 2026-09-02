import type { NotePC, ScaleName } from '@/types/music'

// 標準チューニング（6弦 → 1弦）
export const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const

// キー選択UI・相対調自動連動・キー判定などで共通利用する、選択可能なキー（自然音7種）
export const NATURAL_KEYS: NotePC[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

export const FRET_COUNT = 24
export const DEFAULT_FRET_START = 0
export const DEFAULT_FRET_WIDTH = 12
export const MOBILE_FRET_WIDTH = 6
export const MAX_FRET_START = FRET_COUNT - DEFAULT_FRET_WIDTH
export const MOBILE_MAX_FRET_START = FRET_COUNT - MOBILE_FRET_WIDTH

// ポジションマーク（インレイ）の位置
export const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21] as const
export const DOUBLE_INLAYS = [12, 24] as const

export const SCALE_OPTIONS: { label: string; value: ScaleName }[] = [
  { label: 'Major',            value: 'major' },
  { label: 'Natural Minor',    value: 'minor' },
  { label: 'Major Pentatonic', value: 'major pentatonic' },
  { label: 'Minor Pentatonic', value: 'minor pentatonic' },
  { label: 'Blues',            value: 'blues' },
  { label: 'Dorian',           value: 'dorian' },
  { label: 'Mixolydian',       value: 'mixolydian' },
  { label: 'Harmonic Minor',   value: 'harmonic minor' },
  { label: 'Melodic Minor',    value: 'melodic minor' },
]

// スケール表示名は必ずこのヘルパー経由にし、ページごとに表記がばらつくのを防ぐ
export function getScaleLabel(scaleName: ScaleName): string {
  return SCALE_OPTIONS.find(o => o.value === scaleName)?.label ?? scaleName
}
