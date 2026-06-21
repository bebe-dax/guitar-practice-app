import { Key, Chord, Note, Scale } from 'tonal'
import { isMinorScale } from './scale'
import type { NotePC, ChordName, DiatonicChord, ScaleName } from '@/types/music'

const MAJOR_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const
const MINOR_DEGREES = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as const

export function getDiatonicChords(key: NotePC, scaleName: ScaleName): DiatonicChord[] {
  const minor = isMinorScale(scaleName)
  const parentKey = minor ? Key.minorKey(key).natural : Key.majorKey(key)
  const parentChords = [...parentKey.chords]
  const parentScale = [...parentKey.scale]
  const parentDegrees = minor ? MINOR_DEGREES : MAJOR_DEGREES

  // 7音スケール（major / minor）: 親キーの 7 ダイアトニックコードをそのまま返す
  if (scaleName === 'major' || scaleName === 'minor') {
    return parentChords.map((chord, i) => ({ chord, degree: parentDegrees[i] }))
  }

  // ペンタトニック / ブルース: スケール構成音ごとに親キーの該当度数のコード・度数を引く
  // ブルーノート（親キーに無い音）は度数 ♭v、コードはルート音名のみで表示
  const scaleNotes = Scale.get(`${key} ${scaleName}`).notes
  return scaleNotes.map((n): DiatonicChord => {
    const chroma = Note.chroma(n)
    const idx = parentScale.findIndex(p => Note.chroma(p) === chroma)
    if (idx >= 0) return { chord: parentChords[idx], degree: parentDegrees[idx] }
    return { chord: n, degree: '♭v' }
  })
}

export function getChordNotes(chordName: ChordName): NotePC[] {
  const notes = Chord.get(chordName).notes
  return notes.length > 0 ? [...notes] : []
}

export function getChordRoot(chordName: ChordName): NotePC {
  return Chord.get(chordName).tonic ?? chordName[0]
}
