import { Note } from 'tonal'
import type { NotePC } from '@/types/music'

// フレーズの音名入力用バリデーション。アプリ内の音名表記は一貫してオクターブなしの
// ピッチクラス（例: "C", "F#"）のため、"C4" のようなオクターブ付き表記は無効とする。
export function isValidNoteName(note: NotePC): boolean {
  const parsed = Note.get(note)
  return !parsed.empty && parsed.pc === note
}
