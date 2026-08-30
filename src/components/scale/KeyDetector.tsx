'use client'

import { useState, KeyboardEvent } from 'react'
import { detectKey } from '@/lib/music/key'
import type { KeyCandidate } from '@/lib/music/key'

type Props = {
  onSelect: (candidate: KeyCandidate) => void
}

const CANDIDATE_LABEL = (c: KeyCandidate) => `${c.key}${c.isMinor ? 'm' : ''}`

export default function KeyDetector({ onSelect }: Props) {
  const [input, setInput] = useState('')
  const [candidates, setCandidates] = useState<KeyCandidate[] | null>(null)

  function handleDetect() {
    const chords = input.trim().split(/\s+/).filter(Boolean)
    setCandidates(chords.length > 0 ? detectKey(chords) : null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleDetect()
    }
  }

  function handleSelect(candidate: KeyCandidate) {
    onSelect(candidate)
    setCandidates(null)
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-[12px] text-text-sec font-medium font-jp">
        コードからキーを判定
        <span className="text-text-mut font-normal ml-2">例: Am F C G</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value)
            setCandidates(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="コード名をスペース区切りで入力"
          className="flex-1 min-w-0 bg-surface2 border border-border text-text-pri text-sm font-mono px-[14px] py-[10px] rounded-[10px] outline-none focus:border-accent/60 transition-colors placeholder:text-text-mut placeholder:font-jp"
        />
        <button
          type="button"
          onClick={handleDetect}
          className="text-[13px] font-medium font-jp px-[16px] py-[9px] rounded-[9px] bg-surface2 border border-border text-text-sec hover:text-text-pri hover:bg-surface3 transition-colors flex-shrink-0"
        >
          判定
        </button>
      </div>

      {candidates !== null && candidates.length === 0 && (
        <div className="text-[12px] text-dim font-jp">
          キーを判定できませんでした。コード名を確認してください。
        </div>
      )}

      {candidates !== null && candidates.length === 1 && (
        <button
          type="button"
          onClick={() => handleSelect(candidates[0])}
          className="self-start flex items-center gap-[7px] font-mono text-[13px] font-medium px-[14px] py-[9px] bg-accent-bg border border-accent/40 text-accent rounded-[9px] hover:opacity-90 transition-opacity"
        >
          {CANDIDATE_LABEL(candidates[0])} に切り替える
        </button>
      )}

      {candidates !== null && candidates.length > 1 && (
        <div className="flex flex-col gap-[6px]">
          <div className="text-[12px] text-text-mut font-jp">複数の候補があります。選択してください</div>
          <div className="flex gap-2 flex-wrap">
            {candidates.map(c => (
              <button
                key={CANDIDATE_LABEL(c)}
                type="button"
                onClick={() => handleSelect(c)}
                className="font-mono text-[13px] font-medium px-[14px] py-[9px] bg-surface2 border border-border rounded-[9px] hover:border-accent/60 hover:text-accent transition-colors"
              >
                {CANDIDATE_LABEL(c)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
