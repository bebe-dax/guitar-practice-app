import type { DiatonicChord } from '@/types/music'

type Props = {
  chords: DiatonicChord[]
}

export default function DiatonicChordList({ chords }: Props) {
  return (
    <div className="flex gap-2">
      {chords.map(({ chord, degree }, i) => {
        const isDim = degree.includes('°') || degree.includes('♭')
        const isRoot = i === 0

        return (
          <div
            key={i}
            className={[
              'flex-1 max-w-[86px] rounded-[11px] py-[11px] px-1 text-center cursor-pointer transition-all duration-[120ms] flex flex-col gap-[5px] border',
              isRoot
                ? 'bg-accent-bg border-accent/40'
                : 'bg-surface2 border-transparent hover:bg-surface3',
            ].join(' ')}
          >
            <div className={['text-[11px] font-mono', isDim ? 'text-dim' : 'text-text-mut'].join(' ')}>
              {degree}
            </div>
            <div className={['text-[16px] font-semibold font-mono', isRoot ? 'text-accent' : ''].join(' ')}>
              {chord}
            </div>
          </div>
        )
      })}
    </div>
  )
}
