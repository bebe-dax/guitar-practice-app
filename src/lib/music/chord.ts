import { Key, Chord } from 'tonal'
import type { NotePC, ChordName } from '@/types/music'

export function getDiatonicChords(key: NotePC, isMinor: boolean): ChordName[] {
  if (isMinor) {
    return [...Key.minorKey(key).natural.chords]
  }
  return [...Key.majorKey(key).chords]
}

export function getChordNotes(chordName: ChordName): NotePC[] {
  const notes = Chord.get(chordName).notes
  return notes.length > 0 ? [...notes] : []
}

export function getChordRoot(chordName: ChordName): NotePC {
  return Chord.get(chordName).tonic ?? chordName[0]
}
