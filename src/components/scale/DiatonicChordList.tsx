import type { DiatonicChord } from '@/types/music'

type Props = {
  chords: DiatonicChord[]
}

export default function DiatonicChordList({ chords }: Props) {
  return (
    // auto-fit + minmax で、横スクロール無しに自動的に行を折り返す。
    // モバイル(コンテナ ~318px): 72px最小 → 4列で2行に折返し
    // デスクトップ(~700px超): 7コード全て1行
    <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(72px,1fr))]">
      {chords.map(({ chord, degree }, i) => {
        const isDim = degree.includes('°') || degree.includes('♭')
        const isRoot = i === 0

        return (
          <div
            key={i}
            className={[
              'rounded-[11px] py-[11px] px-1 text-center transition-all duration-[120ms] flex flex-col gap-[5px] border min-w-0',
              isRoot
                ? 'bg-accent-bg border-accent/40'
                : 'bg-surface2 border-transparent',
            ].join(' ')}
          >
            <div className={['text-[11px] font-mono', isDim ? 'text-dim' : 'text-text-mut'].join(' ')}>
              {degree}
            </div>
            <div className={['text-[15px] md:text-[16px] font-semibold font-mono truncate', isRoot ? 'text-accent' : ''].join(' ')}>
              {chord}
            </div>
          </div>
        )
      })}
    </div>
  )
}
