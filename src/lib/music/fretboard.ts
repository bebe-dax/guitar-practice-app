import { Note } from 'tonal'
import { STANDARD_TUNING } from './constants'
import type { NotePC } from '@/types/music'

export type FretboardNote = {
  string: number  // 0=6弦, 5=1弦
  fret: number
  note: string    // オクターブあり 例: "C4"
  pc: NotePC      // ピッチクラス 例: "C"
  isRoot: boolean
}

export function getNotesOnFretboard(
  scaleNotes: NotePC[],
  rootNote: NotePC,
  fretStart: number,
  fretEnd: number,
): FretboardNote[] {
  const result: FretboardNote[] = []

  STANDARD_TUNING.forEach((openNote, stringIndex) => {
    const midiOpen = Note.midi(openNote) ?? 0

    for (let fret = fretStart; fret <= fretEnd; fret++) {
      const midi = midiOpen + fret
      const noteWithOct = Note.fromMidi(midi)
      const pc = Note.pitchClass(noteWithOct)

      if (scaleNotes.includes(pc)) {
        result.push({
          string: stringIndex,
          fret,
          note: noteWithOct,
          pc,
          isRoot: pc === rootNote,
        })
      }
    }
  })

  return result
}
