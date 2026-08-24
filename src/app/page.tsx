'use client'

import { useScale } from '@/hooks/useScale'
import { useIsMobile } from '@/hooks/useIsMobile'
import Fretboard from '@/components/fretboard/Fretboard'
import FretboardLegend from '@/components/fretboard/FretboardLegend'
import FretRangeSlider from '@/components/fretboard/FretRangeSlider'
import KeySelector from '@/components/scale/KeySelector'
import ScaleSelector from '@/components/scale/ScaleSelector'
import ScaleNoteList from '@/components/scale/ScaleNoteList'
import DiatonicChordList from '@/components/scale/DiatonicChordList'
import {
  DEFAULT_FRET_WIDTH,
  MOBILE_FRET_WIDTH,
  MAX_FRET_START,
  MOBILE_MAX_FRET_START,
  getScaleLabel,
} from '@/lib/music/constants'

export default function Home() {
  const { key, setKey, scaleName, setScaleName, fretStart, setFretStart, scaleNotes, diatonicChords, isMinor } = useScale()
  // 指板は lg (1024px) 未満を「モバイル相当 = 6 frets」とする
  // タブレット縦 (768) でも 12 frets を押し込むと文字が潰れるため、6 frets 表示にして可読性を確保
  const isCompactFretboard = useIsMobile(1024)
  const fretWidth = isCompactFretboard ? MOBILE_FRET_WIDTH : DEFAULT_FRET_WIDTH
  const maxFretStart = isCompactFretboard ? MOBILE_MAX_FRET_START : MAX_FRET_START
  // ビューポート切替時、保存済み fretStart が新しい上限を超えていれば表示用にクランプ
  const clampedFretStart = Math.min(fretStart, maxFretStart)

  const scaleLabel = getScaleLabel(scaleName)

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between flex-shrink-0 pl-[52px] md:pl-0">
        <div>
          <div className="text-[20px] font-bold tracking-[-0.01em] font-jp">スケール &amp; 指板</div>
          <div className="text-[12px] text-text-sec mt-[3px] font-jp">キーとスケールを選んで、構成音を指板で確認</div>
        </div>
      </div>

      {/* 上段: 指板カード */}
      <div className="bg-surface border border-border rounded-[14px] p-[16px_20px_14px] flex-shrink-0">
        <div className="flex items-baseline justify-between text-[12px] font-medium font-jp mb-[10px]">
          <span className="text-text-sec">指板</span>
          <span className="text-[11px] text-text-mut font-normal">
            フレット {clampedFretStart + 1}–{clampedFretStart + fretWidth}
          </span>
        </div>
        <div className="overflow-x-auto">
          <Fretboard scaleNotes={scaleNotes} rootNote={key} fretStart={clampedFretStart} fretWidth={fretWidth} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mt-[10px]">
          <FretRangeSlider value={clampedFretStart} onChange={setFretStart} max={maxFretStart} />
          <FretboardLegend />
        </div>
      </div>

      {/* 下段: 選択エリア + 理論情報エリア */}
      <div className="grid gap-4 flex-1 min-h-0 grid-cols-1 md:[grid-template-columns:360px_1fr] md:items-stretch">
        {/* 選択エリア */}
        <div className="bg-surface border border-border rounded-[14px] p-[18px_20px] flex flex-col gap-4 justify-center">
          <div>
            <div className="text-[12px] text-text-sec font-medium font-jp mb-[10px]">キー</div>
            <KeySelector value={key} onChange={setKey} />
          </div>
          <div>
            <div className="text-[12px] text-text-sec font-medium font-jp mb-[10px]">スケール</div>
            <ScaleSelector value={scaleName} onChange={setScaleName} />
          </div>
        </div>

        {/* 理論情報エリア */}
        <div className="bg-surface border border-border rounded-[14px] p-[18px_20px] flex flex-col justify-center gap-4">
          <div>
            <div className="flex items-baseline justify-between text-[12px] font-medium font-jp mb-[10px]">
              <span className="text-text-sec">構成音</span>
              <span className="text-[11px] text-text-mut font-normal">{key} {scaleLabel}</span>
            </div>
            <ScaleNoteList notes={scaleNotes} rootNote={key} />
          </div>
          <div className="pt-4 border-t border-border">
            <div className="flex items-baseline justify-between text-[12px] font-medium font-jp mb-[10px]">
              <span className="text-text-sec">ダイアトニックコード</span>
              <span className="text-[11px] text-text-mut font-normal">{key}{isMinor ? 'm' : ''} キー</span>
            </div>
            <DiatonicChordList chords={diatonicChords} />
          </div>
        </div>
      </div>
    </div>
  )
}
