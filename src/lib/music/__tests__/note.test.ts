import { describe, it, expect } from 'vitest'
import { isValidNoteName } from '../note'

describe('isValidNoteName', () => {
  it.each(['C', 'F#', 'Bb', 'G', 'D#'])('%s は有効', (note) => {
    expect(isValidNoteName(note)).toBe(true)
  })

  it.each(['C4', 'A3', 'Xyz', '', 'あ', 'H'])('%s は無効', (note) => {
    expect(isValidNoteName(note)).toBe(false)
  })
})
