import { Key } from 'tonal'
import type { NotePC, ChordName } from '@/types/music'

export function getDiatonicChords(key: NotePC, isMinor: boolean): ChordName[] {
  if (isMinor) {
    return [...Key.minorKey(key).natural.chords]
  }
  return [...Key.majorKey(key).chords]
}
