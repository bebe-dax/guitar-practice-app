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

  // Note.fromMidi はフラット系（Gb 等）、Scale.get はシャープ系（F# 等）も返す。
  // chroma (0-11) でエンハーモニック等価な音を一致判定し、
  // 表示ラベル (pc) はスケール側の音名を使って音楽的に正しい表記にする。
  const chromaToScaleNote = new Map<number, NotePC>()
  scaleNotes.forEach(n => {
    const c = Note.chroma(n)
    if (c !== undefined) chromaToScaleNote.set(c, n)
  })
  const rootChroma = Note.chroma(rootNote)

  STANDARD_TUNING.forEach((openNote, stringIndex) => {
    const midiOpen = Note.midi(openNote) ?? 0

    for (let fret = fretStart; fret <= fretEnd; fret++) {
      const midi = midiOpen + fret
      const noteWithOct = Note.fromMidi(midi)
      const chroma = Note.chroma(Note.pitchClass(noteWithOct))

      if (chroma !== undefined && chromaToScaleNote.has(chroma)) {
        result.push({
          string: stringIndex,
          fret,
          note: noteWithOct,
          pc: chromaToScaleNote.get(chroma) as NotePC,  // G major → 'F#' not 'Gb'
          isRoot: chroma === rootChroma,
        })
      }
    }
  })

  return result
}
