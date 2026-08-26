'use client'

import { useState, KeyboardEvent } from 'react'
import ScaleSelector from '@/components/scale/ScaleSelector'
import { isValidChordName } from '@/lib/music/chord'
import type { NotePC, ScaleName, ChordName } from '@/types/music'

const KEYS: NotePC[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const SELECT_CLASS =
  'w-full bg-surface2 border border-border text-text-pri text-sm font-ui px-[14px] py-[10px] rounded-[10px] cursor-pointer appearance-none'

const SELECT_ARROW = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238d8d99' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 14px center' as const,
}

type Props = {
  title: string; onTitleChange: (v: string) => void
  keyNote: NotePC; onKeyChange: (v: NotePC) => void
  scaleName: ScaleName; onScaleChange: (v: ScaleName) => void
  chords: ChordName[]; onChordsChange: (v: ChordName[]) => void
  memo: string; onMemoChange: (v: string) => void
  onSave: () => Promise<void>
  onCancel: () => void
}

export default function ProgressionEditor({
  title, onTitleChange,
  keyNote, onKeyChange,
  scaleName, onScaleChange,
  chords, onChordsChange,
  memo, onMemoChange,
  onSave, onCancel,
}: Props) {
  const [chordInput, setChordInput] = useState('')
  const [chordError, setChordError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function addChord() {
    const trimmed = chordInput.trim()
    if (!trimmed) return
    if (!isValidChordName(trimmed)) {
      setChordError(`「${trimmed}」は無効なコード名です`)
      return
    }
    setChordError(null)
    onChordsChange([...chords, trimmed])
    setChordInput('')
  }

  function removeChord(idx: number) {
    onChordsChange(chords.filter((_, i) => i !== idx))
  }

  function handleChordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addChord()
    }
  }

  const canSave = title.trim().length > 0 && chords.length > 0 && !submitting

  async function handleSaveClick() {
    setSubmitting(true)
    try {
      await onSave()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-[14px] p-[22px] flex flex-col gap-5">
      {/* タイトル */}
      <div className="flex flex-col gap-[8px]">
        <label className="text-[12px] text-text-sec font-medium font-jp">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="例: I–V–vi–IV（定番ポップス）"
          className="bg-surface2 border border-border text-text-pri text-sm font-jp px-[14px] py-[10px] rounded-[10px] outline-none focus:border-accent/60 transition-colors placeholder:text-text-mut"
        />
      </div>

      {/* キー / スケール */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-[8px]">
          <label className="text-[12px] text-text-sec font-medium font-jp">キー</label>
          <select
            value={keyNote}
            onChange={e => onKeyChange(e.target.value as NotePC)}
            className={SELECT_CLASS}
            style={SELECT_ARROW}
          >
            {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-[8px]">
          <label className="text-[12px] text-text-sec font-medium font-jp">スケール</label>
          <ScaleSelector value={scaleName} onChange={onScaleChange} />
        </div>
      </div>

      {/* コード進行 */}
      <div className="flex flex-col gap-[8px]">
        <label className="text-[12px] text-text-sec font-medium font-jp">
          コード進行
          <span className="text-text-mut font-normal ml-2">クリックで削除 / Enterで追加</span>
        </label>
        <div className="flex gap-2 flex-wrap items-center">
          {chords.map((chord, i) => (
            <button
              key={i}
              onClick={() => removeChord(i)}
              className="flex items-center gap-[7px] font-mono text-[13px] font-medium px-[14px] py-[9px] bg-surface2 border border-border rounded-[9px] hover:border-dim transition-colors group"
            >
              {chord}
              <span className="text-text-mut text-[11px] group-hover:text-dim transition-colors">✕</span>
            </button>
          ))}
          <input
            type="text"
            value={chordInput}
            onChange={e => {
              setChordInput(e.target.value)
              setChordError(null)
            }}
            onKeyDown={handleChordKeyDown}
            placeholder="+ コード名"
            className="w-[110px] font-mono text-[13px] px-[12px] py-[9px] bg-surface2 border border-dashed border-border rounded-[9px] text-text-pri placeholder:text-text-mut outline-none focus:border-accent/60 transition-colors"
          />
        </div>
        {chordError && <div className="text-[12px] text-dim font-jp">{chordError}</div>}
      </div>

      {/* メモ */}
      <div className="flex flex-col gap-[8px]">
        <label className="text-[12px] text-text-sec font-medium font-jp">メモ</label>
        <textarea
          value={memo}
          onChange={e => onMemoChange(e.target.value)}
          placeholder="この進行についてのメモ..."
          rows={3}
          className="bg-surface2 border border-border text-text-pri text-sm font-jp px-[14px] py-[10px] rounded-[10px] outline-none focus:border-accent/60 transition-colors placeholder:text-text-mut resize-none"
        />
      </div>

      {/* アクション */}
      <div className="flex gap-[10px] justify-end mt-1">
        <button
          onClick={onCancel}
          className="text-[13px] font-medium font-jp px-[16px] py-[9px] rounded-[9px] bg-surface2 border border-border text-text-sec hover:text-text-pri hover:bg-surface3 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSaveClick}
          disabled={!canSave}
          className="text-[13px] font-medium font-jp px-[16px] py-[9px] rounded-[9px] bg-accent text-bg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          保存する
        </button>
      </div>
    </div>
  )
}
