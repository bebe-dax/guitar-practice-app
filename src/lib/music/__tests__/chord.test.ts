import { describe, it, expect } from 'vitest'
import { getDiatonicChords, isValidChordName, getChordNotes, getChordRoot } from '../chord'

describe('getDiatonicChords', () => {
  it('C major: 7和音 + 親キー度数', () => {
    expect(getDiatonicChords('C', 'major')).toEqual([
      { chord: 'Cmaj7', degree: 'I' },
      { chord: 'Dm7', degree: 'ii' },
      { chord: 'Em7', degree: 'iii' },
      { chord: 'Fmaj7', degree: 'IV' },
      { chord: 'G7', degree: 'V' },
      { chord: 'Am7', degree: 'vi' },
      { chord: 'Bm7b5', degree: 'vii°' },
    ])
  })

  it('A minor: 7和音 + 親キー度数', () => {
    expect(getDiatonicChords('A', 'minor')).toEqual([
      { chord: 'Am7', degree: 'i' },
      { chord: 'Bm7b5', degree: 'ii°' },
      { chord: 'Cmaj7', degree: 'III' },
      { chord: 'Dm7', degree: 'iv' },
      { chord: 'Em7', degree: 'v' },
      { chord: 'Fmaj7', degree: 'VI' },
      { chord: 'G7', degree: 'VII' },
    ])
  })

  it('C major pentatonic: スケールに関わらず親キー(Cメジャー)の7和音', () => {
    expect(getDiatonicChords('C', 'major pentatonic')).toEqual(getDiatonicChords('C', 'major'))
  })

  it('A minor pentatonic: スケールに関わらず親キー(Aマイナー)の7和音', () => {
    expect(getDiatonicChords('A', 'minor pentatonic')).toEqual(getDiatonicChords('A', 'minor'))
  })

  it('A blues: スケールに関わらず親キー(Aマイナー)の7和音', () => {
    expect(getDiatonicChords('A', 'blues')).toEqual(getDiatonicChords('A', 'minor'))
  })

  it('A dorian: スケールに関わらず親キー(Aマイナー)の7和音', () => {
    expect(getDiatonicChords('A', 'dorian')).toEqual(getDiatonicChords('A', 'minor'))
  })

  it('A harmonic minor: スケールに関わらず親キー(Aマイナー)の7和音', () => {
    expect(getDiatonicChords('A', 'harmonic minor')).toEqual(getDiatonicChords('A', 'minor'))
  })

  it('A melodic minor: スケールに関わらず親キー(Aマイナー)の7和音', () => {
    expect(getDiatonicChords('A', 'melodic minor')).toEqual(getDiatonicChords('A', 'minor'))
  })

  it('C mixolydian: スケールに関わらず親キー(Cメジャー)の7和音', () => {
    expect(getDiatonicChords('C', 'mixolydian')).toEqual(getDiatonicChords('C', 'major'))
  })
})

describe('isValidChordName', () => {
  it.each(['Cmaj7', 'F#m7b5', 'Dm7', 'G7', 'C', 'Bb'])('%s は有効', (chord) => {
    expect(isValidChordName(chord)).toBe(true)
  })

  it.each(['Xyz', '', 'あいうえお'])('%s は無効', (chord) => {
    expect(isValidChordName(chord)).toBe(false)
  })

  it.each(['m', '7', '9', 'sus4', 'dim', '5', 'maj7'])('ルート音なしの%sは無効', (chord) => {
    expect(isValidChordName(chord)).toBe(false)
  })

  it.each(['C ', ' C', ' C ', 'Cmaj7 ', ' Cmaj7', 'C/E ', ' C/E '])(
    '前後に空白を含む%sは無効（isValidNoteNameと一貫した挙動）',
    (chord) => {
      expect(isValidChordName(chord)).toBe(false)
    }
  )
})

describe('getChordNotes', () => {
  it('有効なコードは構成音の配列を返す', () => {
    expect(getChordNotes('Cmaj7')).toEqual(['C', 'E', 'G', 'B'])
    expect(getChordNotes('Am7')).toEqual(['A', 'C', 'E', 'G'])
  })

  it('無効なコードは空配列を返す', () => {
    expect(getChordNotes('Xyz')).toEqual([])
    expect(getChordNotes('')).toEqual([])
  })

  it('スラッシュコードはベース音を含めた構成音を返す', () => {
    expect(getChordNotes('C/E')).toEqual(['E', 'G', 'C'])
  })
})

describe('getChordRoot', () => {
  it('ルートありコードはtonicを返す', () => {
    expect(getChordRoot('Cmaj7')).toBe('C')
    expect(getChordRoot('Am7')).toBe('A')
  })

  it('スラッシュコードはtonic（分数コードの上部の音）を返す', () => {
    expect(getChordRoot('C/E')).toBe('C')
  })

  it.each(['m', '7', '9', 'sus4', 'dim'])('ルート音なしの%sは空文字を返さずchordName[0]にフォールバックする', (chord) => {
    expect(getChordRoot(chord)).toBe(chord[0])
    expect(getChordRoot(chord)).not.toBe('')
  })
})
