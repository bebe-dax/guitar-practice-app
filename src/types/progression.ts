import type { NotePC, ScaleName, ChordName } from './music'

type ProgressionItemBase = {
  id: string
  title: string
  key: NotePC
  scale: ScaleName
  memo: string
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}

export type Progression = ProgressionItemBase & {
  type: 'progression'
  chords: ChordName[]
}

export type Phrase = ProgressionItemBase & {
  type: 'phrase'
  notes: NotePC[]
}

// 一覧・Firestore格納単位として progression と phrase を共通に扱う判別共用体
export type ProgressionItem = Progression | Phrase
