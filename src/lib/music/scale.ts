import { Scale } from 'tonal'
import type { NotePC, ScaleName } from '@/types/music'

export function getScaleNotes(key: NotePC, scaleName: ScaleName): NotePC[] {
  return Scale.get(`${key} ${scaleName}`).notes
}
