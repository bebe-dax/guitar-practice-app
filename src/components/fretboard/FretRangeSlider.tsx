'use client'

import { MAX_FRET_START } from '@/lib/music/constants'

type Props = {
  value: number
  onChange: (value: number) => void
}

export default function FretRangeSlider({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-text-sec font-jp whitespace-nowrap">開始フレット</span>
      <input
        type="range"
        min={0}
        max={MAX_FRET_START}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 max-w-[320px] h-1"
        style={{ accentColor: 'var(--color-accent)' }}
      />
      <span className="font-mono text-[13px] text-accent min-w-[44px]">{value}</span>
    </div>
  )
}
