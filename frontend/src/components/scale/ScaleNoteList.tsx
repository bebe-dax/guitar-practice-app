import type { NotePC } from '@/types/music'

type Props = {
  notes: NotePC[]
  rootNote: NotePC
}

export default function ScaleNoteList({ notes, rootNote }: Props) {
  return (
    <div className="flex gap-[7px] md:gap-[9px] flex-wrap">
      {notes.map((note, i) => (
        <div
          key={i}
          className={[
            'w-[44px] h-[44px] md:w-[50px] md:h-[50px] rounded-[11px] grid place-items-center font-mono text-[15px] md:text-[16px] font-semibold border-[1.5px]',
            note === rootNote
              ? 'bg-root-bg border-root text-root'
              : 'bg-note-bg border-note text-note',
          ].join(' ')}
        >
          {note}
        </div>
      ))}
    </div>
  )
}
