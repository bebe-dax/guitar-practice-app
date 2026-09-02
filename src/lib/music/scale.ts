import { Scale, Key } from 'tonal'
import { NATURAL_KEYS } from './constants'
import type { NotePC, ScaleName } from '@/types/music'

const MINOR_PARITY_SCALES: ScaleName[] = [
  'minor',
  'minor pentatonic',
  'blues',
  'dorian',
  'harmonic minor',
  'melodic minor',
]

export function isMinorScale(scaleName: ScaleName): boolean {
  return MINOR_PARITY_SCALES.includes(scaleName)
}

export function getScaleNotes(key: NotePC, scaleName: ScaleName): NotePC[] {
  return Scale.get(`${key} ${scaleName}`).notes
}

// スケール種別が変わるときのキー自動連動（相対調）
// 相対調がキーセレクターにない音（C#, Eb 等）の場合は元のキーを返す
export function getRelativeKey(key: NotePC, toMinor: boolean): NotePC {
  const relative = toMinor
    ? Key.majorKey(key).minorRelative
    : Key.minorKey(key).relativeMajor
  return NATURAL_KEYS.includes(relative) ? relative : key
}
