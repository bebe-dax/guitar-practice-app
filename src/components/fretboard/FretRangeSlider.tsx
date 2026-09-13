'use client'

import { useId } from 'react'
import { MAX_FRET_START } from '@/lib/music/constants'

type Props = {
  value: number
  onChange: (value: number) => void
  max?: number
}

export default function FretRangeSlider({ value, onChange, max = MAX_FRET_START }: Props) {
  const inputId = useId()

  return (
    <div className="flex items-center gap-4">
      <label htmlFor={inputId} className="text-sm text-text-sec font-jp whitespace-nowrap">
        開始フレット
      </label>
      <input
        id={inputId}
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 max-w-[320px] h-1"
        style={{ accentColor: 'var(--color-accent)' }}
      />
      <span className="font-mono text-[13px] text-accent min-w-[44px]">{value}</span>
    </div>
  )
}
