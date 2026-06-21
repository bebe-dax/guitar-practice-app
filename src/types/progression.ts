import type { NotePC, ScaleName, ChordName } from './music'

export type Progression = {
  id: string
  title: string
  key: NotePC
  scale: ScaleName
  chords: ChordName[]
  memo: string
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}

// Phase 2 で使用
export type Phrase = {
  id: string
  title: string
  key: NotePC
  scale: ScaleName
  notes: string[]   // 音名リスト
  memo: string
  createdAt: string  // ISO 8601
}
