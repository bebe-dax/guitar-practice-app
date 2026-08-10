'use client'

import { SCALE_OPTIONS } from '@/lib/music/constants'
import type { ScaleName } from '@/types/music'

type Props = {
  value: ScaleName
  onChange: (scale: ScaleName) => void
}

export default function ScaleSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as ScaleName)}
      className="w-full bg-surface2 border border-border text-text-pri text-sm font-ui px-[14px] py-[10px] rounded-[10px] cursor-pointer appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238d8d99' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
      }}
    >
      {SCALE_OPTIONS.map(({ label, value: val }) => (
        <option key={val} value={val}>{label}</option>
      ))}
    </select>
  )
}
