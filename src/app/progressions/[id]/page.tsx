'use client'

import { use, useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProgressions } from '@/hooks/useProgressions'
import { useIsMobile } from '@/hooks/useIsMobile'
import { getChordNotes, getChordRoot } from '@/lib/music/chord'
import {
  DEFAULT_FRET_START,
  DEFAULT_FRET_WIDTH,
  MOBILE_FRET_WIDTH,
  MAX_FRET_START,
  MOBILE_MAX_FRET_START,
  getScaleLabel,
} from '@/lib/music/constants'
import Fretboard from '@/components/fretboard/Fretboard'
import FretRangeSlider from '@/components/fretboard/FretRangeSlider'
import ProgressionPlayer from '@/components/progression/ProgressionPlayer'
import ProgressionEditor from '@/components/progression/ProgressionEditor'
import type { NotePC, ScaleName, ChordName } from '@/types/music'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export default function ProgressionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { progressions, loading, remove, update } = useProgressions()

  const isCompactFretboard = useIsMobile(1024)
  const fretWidth = isCompactFretboard ? MOBILE_FRET_WIDTH : DEFAULT_FRET_WIDTH
  const maxFretStart = isCompactFretboard ? MOBILE_MAX_FRET_START : MAX_FRET_START

  const [selectedChordIdx, setSelectedChordIdx] = useState(0)
  const [fretStart, setFretStart] = useState(DEFAULT_FRET_START)
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const clampedFretStart = Math.min(fretStart, maxFretStart)

  // 編集フォーム用state
  const [editTitle, setEditTitle] = useState('')
  const [editKey, setEditKey] = useState<NotePC>('C')
  const [editScale, setEditScale] = useState<ScaleName>('major')
  const [editChords, setEditChords] = useState<ChordName[]>([])
  const [editMemo, setEditMemo] = useState('')

  const progression = progressions.find(p => p.id === id)

  const chordNotes = useMemo(() => {
    if (!progression) return []
    const chord = progression.chords[selectedChordIdx]
    if (!chord) return []
    return getChordNotes(chord)
  }, [progression, selectedChordIdx])

  const chordRoot = useMemo(() => {
    if (!progression) return 'C' as NotePC
    const chord = progression.chords[selectedChordIdx]
    if (!chord) return 'C' as NotePC
    return getChordRoot(chord) as NotePC
  }, [progression, selectedChordIdx])

  useEffect(() => {
    if (!loading && !progression) {
      router.replace('/progressions')
    }
  }, [loading, progression, router])

  if (loading || !progression) return null

  const scaleLabel = getScaleLabel(progression.scale)

  function startEdit() {
    setEditTitle(progression!.title)
    setEditKey(progression!.key)
    setEditScale(progression!.scale)
    setEditChords([...progression!.chords])
    setEditMemo(progression!.memo)
    setIsEditing(true)
  }

  async function handleUpdate() {
    setSaveError(null)
    try {
      await update(id, { title: editTitle, key: editKey, scale: editScale, chords: editChords, memo: editMemo })
      setIsEditing(false)
    } catch {
      setSaveError('更新に失敗しました')
    }
  }

  async function handleDelete() {
    setSaveError(null)
    try {
      await remove(id)
      router.push('/progressions')
    } catch {
      setSaveError('削除に失敗しました')
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex-shrink-0 pl-[52px] md:pl-0">
          <div className="text-[20px] font-bold tracking-[-0.01em] font-jp">編集</div>
          <div className="text-[12px] text-text-sec mt-[3px] font-jp">{progression.title}</div>
          {saveError && <div className="text-[12px] text-dim font-jp mt-1">{saveError}</div>}
        </div>
        <ProgressionEditor
          title={editTitle} onTitleChange={setEditTitle}
          keyNote={editKey} onKeyChange={setEditKey}
          scaleName={editScale} onScaleChange={setEditScale}
          chords={editChords} onChordsChange={setEditChords}
          memo={editMemo} onMemoChange={setEditMemo}
          onSave={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between flex-shrink-0 pl-[52px] md:pl-0 gap-3">
        <div className="min-w-0">
          <div className="mb-2">
            <span className="text-[11px] font-jp px-[11px] py-[3px] rounded-full border border-accent/40 text-accent bg-accent-bg">
              コード進行
            </span>
          </div>
          <div className="text-[20px] font-bold tracking-[-0.01em] font-jp break-words">{progression.title}</div>
          <div className="text-[12px] text-text-sec mt-[3px] font-mono">
            {formatDate(progression.createdAt)} 作成 ・ {formatDate(progression.updatedAt)} 更新
          </div>
          {saveError && <div className="text-[12px] text-dim font-jp mt-1">{saveError}</div>}
        </div>
        <div className="flex gap-[9px] flex-wrap">
          <button
            onClick={startEdit}
            className="text-[13px] font-medium font-jp px-[14px] py-[8px] rounded-[9px] bg-surface2 border border-border text-text-sec hover:text-text-pri hover:bg-surface3 transition-colors"
          >
            編集
          </button>
          {confirmDelete ? (
            <div className="flex gap-2 items-center">
              <span className="text-[12px] text-text-sec font-jp">本当に削除しますか？</span>
              <button
                onClick={handleDelete}
                className="text-[13px] font-medium font-jp px-[14px] py-[8px] rounded-[9px] bg-dim/20 border border-dim/40 text-dim hover:bg-dim/30 transition-colors"
              >
                削除する
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[13px] font-medium font-jp px-[14px] py-[8px] rounded-[9px] bg-surface2 border border-border text-text-sec hover:bg-surface3 transition-colors"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-[13px] font-medium font-jp px-[14px] py-[8px] rounded-[9px] bg-surface2 border border-dim/40 text-dim hover:bg-dim/10 transition-colors"
            >
              削除
            </button>
          )}
        </div>
      </div>

      {/* 上段: 指板カード */}
      <div className="bg-surface border border-border rounded-[14px] p-[16px_20px_14px] flex-shrink-0">
        <div className="flex items-baseline justify-between text-[12px] font-medium font-jp mb-[10px]">
          <span className="text-text-sec">指板プレビュー</span>
          <span className="text-[11px] text-text-mut font-mono">
            {progression.chords[selectedChordIdx] ?? '—'} の構成音 ({chordNotes.join(', ')})
          </span>
        </div>
        <div className="overflow-x-auto">
          <Fretboard scaleNotes={chordNotes} rootNote={chordRoot} fretStart={clampedFretStart} fretWidth={fretWidth} />
        </div>
        <div className="mt-[10px]">
          <FretRangeSlider value={clampedFretStart} onChange={setFretStart} max={maxFretStart} />
        </div>
      </div>

      {/* 下段: メタ情報 + ステッパー */}
      <div className="grid gap-4 flex-1 min-h-0 grid-cols-1 md:[grid-template-columns:360px_1fr] md:items-stretch">
        {/* メタ情報 */}
        <div className="bg-surface border border-border rounded-[14px] p-[18px_20px] flex flex-col gap-4">
          <div>
            <div className="text-[11px] text-text-mut font-jp mb-[3px]">キー / スケール</div>
            <div className="text-[14px] font-mono font-medium text-text-pri">
              {progression.key} / {scaleLabel}
            </div>
          </div>
          {progression.memo && (
            <div>
              <div className="text-[11px] text-text-mut font-jp mb-[3px]">メモ</div>
              <div className="text-[13px] text-text-sec font-jp leading-[1.6] mt-1">
                {progression.memo}
              </div>
            </div>
          )}
        </div>

        {/* コードステッパー */}
        <div className="bg-surface border border-border rounded-[14px] p-[18px_20px] flex flex-col justify-center gap-4">
          <div className="text-[12px] text-text-sec font-medium font-jp">
            コード進行
            <span className="text-text-mut font-normal ml-2">クリックで指板に表示</span>
          </div>
          <ProgressionPlayer
            chords={progression.chords}
            selectedIdx={selectedChordIdx}
            onSelect={setSelectedChordIdx}
          />
        </div>
      </div>
    </div>
  )
}
