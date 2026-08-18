import Link from 'next/link'
import type { Progression } from '@/types/progression'

const ACCENT_COLORS = [
  'var(--color-accent)',
  'var(--color-purple)',
  'var(--color-amber)',
] as const

type Props = {
  progression: Progression
  index: number
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function formatScale(scale: string): string {
  return scale.replace(/\b\w/g, c => c.toUpperCase())
}

export default function ProgressionCard({ progression, index }: Props) {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length]

  return (
    <Link href={`/progressions/${progression.id}`}>
      <div
        className="relative flex flex-col bg-surface border border-border rounded-[13px] p-[18px_18px_16px_22px] overflow-hidden cursor-pointer transition-all duration-150 hover:border-text-mut hover:-translate-y-px h-full"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accentColor }} />

        <div className="flex justify-between items-center mb-[11px]">
          <span
            className="text-[11px] font-jp px-[11px] py-[3px] rounded-full border"
            style={{
              color: accentColor,
              background: `color-mix(in srgb, ${accentColor} 16%, transparent)`,
              borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
            }}
          >
            コード進行
          </span>
          <span className="text-[11px] text-text-mut font-mono">
            {formatDate(progression.createdAt)}
          </span>
        </div>

        <h3 className="text-[15px] font-bold font-jp mb-[5px] leading-snug">
          {progression.title}
        </h3>

        <div className="text-[12px] text-text-sec font-mono mb-[12px]">
          Key: {progression.key} / {formatScale(progression.scale)}
        </div>

        <div className="flex gap-[6px] flex-wrap mb-[11px]">
          {progression.chords.map((chord, i) => (
            <span
              key={i}
              className="font-mono text-[12px] font-medium px-[11px] py-1 bg-surface2 rounded-full text-text-sec"
            >
              {chord}
            </span>
          ))}
        </div>

        {progression.memo && (
          <div className="text-[12px] text-text-mut font-jp leading-[1.5] mt-auto">
            {progression.memo}
          </div>
        )}
      </div>
    </Link>
  )
}
