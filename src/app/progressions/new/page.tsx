'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProgressions } from '@/hooks/useProgressions'
import { useScale } from '@/hooks/useScale'
import ProgressionEditor from '@/components/progression/ProgressionEditor'
import Fretboard from '@/components/fretboard/Fretboard'
import FretRangeSlider from '@/components/fretboard/FretRangeSlider'
import type { NotePC, ScaleName, ChordName } from '@/types/music'

export default function NewProgressionPage() {
  const router = useRouter()
  const { save } = useProgressions()
  const { scaleNotes, fretStart, setFretStart } = useScale()

  const [title, setTitle] = useState('')
  const [keyNote, setKeyNote] = useState<NotePC>('C')
  const [scaleName, setScaleName] = useState<ScaleName>('major')
  const [chords, setChords] = useState<ChordName[]>([])
  const [memo, setMemo] = useState('')
  const [selectedChordIdx, setSelectedChordIdx] = useState(0)

  function handleSave() {
    save({ title, key: keyNote, scale: scaleName, chords, memo })
    router.push('/progressions')
  }

  function handleCancel() {
    router.push('/progressions')
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-shrink-0 pl-[52px] md:pl-0">
        <div className="text-[20px] font-bold tracking-[-0.01em] font-jp">新規作成</div>
        <div className="text-[12px] text-text-sec mt-[3px] font-jp">コード進行を登録</div>
      </div>

      <div className="grid gap-4 flex-1 min-h-0 grid-cols-1 lg:grid-cols-2 lg:items-start">
        {/* 左: フォーム */}
        <ProgressionEditor
          title={title} onTitleChange={setTitle}
          keyNote={keyNote} onKeyChange={setKeyNote}
          scaleName={scaleName} onScaleChange={setScaleName}
          chords={chords} onChordsChange={setChords}
          memo={memo} onMemoChange={setMemo}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* 右: プレビュー */}
        <div className="bg-surface border border-border rounded-[14px] p-[22px] flex flex-col gap-4">
          <div className="text-[12px] text-text-sec font-medium font-jp">
            プレビュー
            <span className="text-text-mut font-normal ml-2">
              {keyNote} {scaleName}
            </span>
          </div>

          <div className="overflow-x-auto">
            <Fretboard scaleNotes={scaleNotes} rootNote={keyNote} fretStart={fretStart} />
          </div>

          <FretRangeSlider value={fretStart} onChange={setFretStart} />

          {chords.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
              {chords.map((chord, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedChordIdx(i)}
                  className={[
                    'font-mono text-[13px] font-semibold px-[16px] py-[8px] rounded-[11px] border-[1.5px] transition-all duration-[130ms]',
                    i === selectedChordIdx
                      ? 'bg-root-bg border-root text-root'
                      : 'bg-surface2 border-transparent text-text-sec hover:text-text-pri',
                  ].join(' ')}
                >
                  {chord}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
