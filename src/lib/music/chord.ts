import { Key, Chord } from 'tonal'
import { isMinorScale } from './scale'
import type { NotePC, ChordName, DiatonicChord, ScaleName } from '@/types/music'

const MAJOR_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const
const MINOR_DEGREES = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as const

// ダイアトニックコードはキー（長調/短調）のみで決まり、選択中のスケール（メジャー/
// ペンタトニック/ブルース等）には依存しない。ペンタトニック・ブルースは特定の
// 長調/短調キーから派生したサブセットであり、それ自体が独立したダイアトニックコードを
// 持つわけではないため、常に派生元キーの7コードを返す。
export function getDiatonicChords(key: NotePC, scaleName: ScaleName): DiatonicChord[] {
  const minor = isMinorScale(scaleName)
  const parentKey = minor ? Key.minorKey(key).natural : Key.majorKey(key)
  const degrees = minor ? MINOR_DEGREES : MAJOR_DEGREES
  return parentKey.chords.map((chord, i) => ({ chord, degree: degrees[i] }))
}

export function isValidChordName(chordName: ChordName): boolean {
  return !Chord.get(chordName).empty
}

export function getChordNotes(chordName: ChordName): NotePC[] {
  const notes = Chord.get(chordName).notes
  return notes.length > 0 ? [...notes] : []
}

export function getChordRoot(chordName: ChordName): NotePC {
  return Chord.get(chordName).tonic ?? chordName[0]
}
