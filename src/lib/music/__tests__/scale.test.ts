import { describe, it, expect } from 'vitest'
import { getScaleNotes, getRelativeKey } from '../scale'
import { getDiatonicChords, isValidChordName } from '../chord'

describe('getScaleNotes', () => {
  it('C major', () => {
    expect(getScaleNotes('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('A minor', () => {
    expect(getScaleNotes('A', 'minor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('C major pentatonic', () => {
    expect(getScaleNotes('C', 'major pentatonic')).toEqual(['C', 'D', 'E', 'G', 'A'])
  })

  it('A minor pentatonic', () => {
    expect(getScaleNotes('A', 'minor pentatonic')).toEqual(['A', 'C', 'D', 'E', 'G'])
  })

  it('A blues', () => {
    expect(getScaleNotes('A', 'blues')).toEqual(['A', 'C', 'D', 'Eb', 'E', 'G'])
  })
})

describe('getRelativeKey', () => {
  it('長調→短調: C major → A minor', () => {
    expect(getRelativeKey('C', true)).toBe('A')
  })
  it('長調→短調: G major → E minor', () => {
    expect(getRelativeKey('G', true)).toBe('E')
  })
  it('長調→短調: F major → D minor', () => {
    expect(getRelativeKey('F', true)).toBe('D')
  })
  it('長調→短調: D major → B minor', () => {
    expect(getRelativeKey('D', true)).toBe('B')
  })
  it('短調→長調: A minor → C major', () => {
    expect(getRelativeKey('A', false)).toBe('C')
  })
  it('短調→長調: E minor → G major', () => {
    expect(getRelativeKey('E', false)).toBe('G')
  })
  it('短調→長調: B minor → D major', () => {
    expect(getRelativeKey('B', false)).toBe('D')
  })
  it('相対調が非自然音の場合は元のキーを返す（E major → C# minor は E のまま）', () => {
    expect(getRelativeKey('E', true)).toBe('E')
  })
  it('相対調が非自然音の場合は元のキーを返す（C minor → Eb major は C のまま）', () => {
    expect(getRelativeKey('C', false)).toBe('C')
  })
})

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
})

describe('isValidChordName', () => {
  it.each(['Cmaj7', 'F#m7b5', 'Dm7', 'G7', 'C', 'Bb'])('%s は有効', (chord) => {
    expect(isValidChordName(chord)).toBe(true)
  })

  it.each(['Xyz', '', 'あいうえお'])('%s は無効', (chord) => {
    expect(isValidChordName(chord)).toBe(false)
  })
})
