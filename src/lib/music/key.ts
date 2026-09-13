import { Chord, Key } from 'tonal'
import { isValidChordName } from './chord'
import { NATURAL_KEYS } from './constants'
import type { NotePC, ChordName } from '@/types/music'

export type KeyCandidate = {
  key: NotePC
  isMinor: boolean
}

type ParsedChord = {
  root: NotePC
  quality: string
}

function parseChord(chordName: ChordName): ParsedChord | null {
  const chord = Chord.get(chordName)
  if (chord.empty || !chord.tonic) return null
  return { root: chord.tonic, quality: chord.quality }
}

function getDiatonicTriads(key: NotePC, isMinor: boolean): ParsedChord[] {
  const triads = isMinor ? Key.minorKey(key).natural.triads : Key.majorKey(key).triads
  return triads
    .map(parseChord)
    .filter((c): c is ParsedChord => c !== null)
}

// 入力コード群からキー（調）を推定する。
// 候補キー（自然音7種 × 長調/短調 = 14通り）ごとに、そのダイアトニックトライアド
// （ルート+クオリティ）と入力コードが一致する数をスコアとし、最多のものを候補として返す。
// 同点の場合は、先頭コードを主和音（トニック）とみなす慣習に基づき、先頭コードの
// (ルート, クオリティ) が候補キーのトニックと一致するものへ絞り込む。
// 絞り込んでも複数残る場合は真に曖昧（例: 単一コード入力）とみなし、複数候補をそのまま返す。
export function detectKey(chords: ChordName[]): KeyCandidate[] {
  const parsed = chords
    .filter(isValidChordName)
    .map(parseChord)
    .filter((c): c is ParsedChord => c !== null)
  if (parsed.length === 0) return []

  const [firstChord] = parsed

  const candidates = NATURAL_KEYS.flatMap(key =>
    [false, true].map(isMinor => {
      const diatonic = getDiatonicTriads(key, isMinor)
      const score = parsed.filter(p =>
        diatonic.some(d => d.root === p.root && d.quality === p.quality)
      ).length
      const isTonicMatch =
        firstChord.root === key && firstChord.quality === (isMinor ? 'Minor' : 'Major')
      return { key, isMinor, score, isTonicMatch }
    })
  )

  const maxScore = Math.max(...candidates.map(c => c.score))
  if (maxScore === 0) return []

  const topByScore = candidates.filter(c => c.score === maxScore)
  const tonicMatches = topByScore.filter(c => c.isTonicMatch)
  const result = tonicMatches.length > 0 ? tonicMatches : topByScore

  return result.map(({ key, isMinor }) => ({ key, isMinor }))
}
