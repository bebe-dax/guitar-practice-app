import { Fragment } from 'react'
import type { ChordName } from '@/types/music'

type Props = {
  chords: ChordName[]
  selectedIdx: number
  onSelect: (idx: number) => void
}

export default function ProgressionPlayer({ chords, selectedIdx, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      {chords.map((chord, i) => (
        <Fragment key={i}>
          <button
            onClick={() => onSelect(i)}
            className={[
              'font-mono text-[15px] font-semibold px-[22px] py-[11px] rounded-[11px] border-[1.5px] transition-all duration-[130ms] cursor-pointer',
              i === selectedIdx
                ? 'bg-root-bg border-root text-root'
                : 'bg-surface2 border-transparent text-text-sec hover:text-text-pri',
            ].join(' ')}
          >
            {chord}
          </button>
          {i < chords.length - 1 && (
            <span className="text-[13px] text-text-mut">→</span>
          )}
        </Fragment>
      ))}
    </div>
  )
}
