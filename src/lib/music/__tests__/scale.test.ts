import { describe, it, expect } from 'vitest'
import { getScaleNotes, getRelativeKey } from '../scale'
import { getScaleLabel } from '../constants'

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

  it('C dorian', () => {
    expect(getScaleNotes('C', 'dorian')).toEqual(['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'])
  })

  it('C mixolydian', () => {
    expect(getScaleNotes('C', 'mixolydian')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'Bb'])
  })

  it('C harmonic minor', () => {
    expect(getScaleNotes('C', 'harmonic minor')).toEqual(['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'])
  })

  it('C melodic minor', () => {
    expect(getScaleNotes('C', 'melodic minor')).toEqual(['C', 'D', 'Eb', 'F', 'G', 'A', 'B'])
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

describe('getScaleLabel', () => {
  it('SCALE_OPTIONSに定義されたラベルを返す', () => {
    expect(getScaleLabel('major')).toBe('Major')
    expect(getScaleLabel('minor')).toBe('Natural Minor')
    expect(getScaleLabel('major pentatonic')).toBe('Major Pentatonic')
    expect(getScaleLabel('minor pentatonic')).toBe('Minor Pentatonic')
    expect(getScaleLabel('blues')).toBe('Blues')
    expect(getScaleLabel('dorian')).toBe('Dorian')
    expect(getScaleLabel('mixolydian')).toBe('Mixolydian')
    expect(getScaleLabel('harmonic minor')).toBe('Harmonic Minor')
    expect(getScaleLabel('melodic minor')).toBe('Melodic Minor')
  })
})
