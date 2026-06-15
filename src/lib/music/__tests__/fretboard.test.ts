import { describe, it, expect } from 'vitest'
import { getNotesOnFretboard } from '../fretboard'

// C major: C D E F G A B
const C_MAJOR = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

describe('getNotesOnFretboard', () => {
  it('開放弦（fret=0）が含まれる', () => {
    // 6弦開放 = E2、C major 構成音
    const notes = getNotesOnFretboard(C_MAJOR, 'C', 0, 0)
    const openStrings = notes.filter(n => n.fret === 0)
    // 6弦(E), 2弦(B), 1弦(E) が C major に含まれる
    expect(openStrings.length).toBeGreaterThan(0)
    expect(openStrings.some(n => n.string === 0 && n.note === 'E2')).toBe(true) // 6弦
    expect(openStrings.some(n => n.string === 4 && n.note === 'B3')).toBe(true) // 2弦
    expect(openStrings.some(n => n.string === 5 && n.note === 'E4')).toBe(true) // 1弦
  })

  it('isRoot が正しく判定される', () => {
    const notes = getNotesOnFretboard(C_MAJOR, 'C', 0, 3)
    const roots = notes.filter(n => n.isRoot)
    expect(roots.length).toBeGreaterThan(0)
    roots.forEach(n => expect(n.note).toMatch(/^C/))

    const nonRoots = notes.filter(n => !n.isRoot)
    nonRoots.forEach(n => expect(n.note).not.toMatch(/^C/))
  })

  it('フレット範囲の下限・上限が境界値を含む', () => {
    const notes = getNotesOnFretboard(C_MAJOR, 'C', 3, 5)
    notes.forEach(n => {
      expect(n.fret).toBeGreaterThanOrEqual(3)
      expect(n.fret).toBeLessThanOrEqual(5)
    })
  })

  it('スケール外の音は含まれない', () => {
    const notes = getNotesOnFretboard(C_MAJOR, 'C', 0, 12)
    notes.forEach(n => {
      const { Note } = require('tonal')
      const pc = Note.pitchClass(n.note)
      expect(C_MAJOR).toContain(pc)
    })
  })

  it('空のスケールを渡すと空配列を返す', () => {
    expect(getNotesOnFretboard([], 'C', 0, 12)).toEqual([])
  })
})
