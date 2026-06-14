import { describe, it, expect } from 'vitest'
import { getScaleNotes } from '../scale'
import { getDiatonicChords } from '../chord'

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

describe('getDiatonicChords', () => {
  it('C major ダイアトニックコード', () => {
    expect(getDiatonicChords('C', false)).toEqual([
      'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5',
    ])
  })

  it('A minor ダイアトニックコード', () => {
    expect(getDiatonicChords('A', true)).toEqual([
      'Am7', 'Bm7b5', 'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7',
    ])
  })
})
