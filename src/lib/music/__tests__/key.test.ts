import { describe, it, expect } from 'vitest'
import { detectKey } from '../key'

describe('detectKey', () => {
  it('C G Am F: 先頭コードがトニック(C)なので C major と判定', () => {
    expect(detectKey(['C', 'G', 'Am', 'F'])).toEqual([{ key: 'C', isMinor: false }])
  })

  it('Am F C G: 先頭コードがトニック(Am)なので A minor と判定', () => {
    expect(detectKey(['Am', 'F', 'C', 'G'])).toEqual([{ key: 'A', isMinor: true }])
  })

  it('A7 D7 E7: すべてA majorのダイアトニックトライアドと一致', () => {
    expect(detectKey(['A7', 'D7', 'E7'])).toEqual([{ key: 'A', isMinor: false }])
  })

  it('空配列は判定不能', () => {
    expect(detectKey([])).toEqual([])
  })

  it('無効なコード名のみの場合は判定不能', () => {
    expect(detectKey(['Xyz', ''])).toEqual([])
  })

  it('どの自然音キーのダイアトニックコードにも一致しない場合は判定不能', () => {
    expect(detectKey(['C#aug'])).toEqual([])
  })

  it('単一コード(Am)は複数キーで曖昧だが、先頭=トニックの慣習でA minorに絞り込まれる', () => {
    expect(detectKey(['Am'])).toEqual([{ key: 'A', isMinor: true }])
  })

  it('無効なコードが混ざっていても有効なコードのみで判定する', () => {
    expect(detectKey(['C', 'Xyz', 'G', 'Am', 'F'])).toEqual([{ key: 'C', isMinor: false }])
  })
})
