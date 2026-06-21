import type { NotePC } from '@/types/music'

type Props = {
  notes: NotePC[]
  rootNote: NotePC
}

export default function ScaleNoteList({ notes, rootNote }: Props) {
  return (
    <div className="flex gap-[9px]">
      {notes.map((note, i) => (
        <div
          key={i}
          className={[
            'w-[50px] h-[50px] rounded-[11px] grid place-items-center font-mono text-[16px] font-semibold border-[1.5px]',
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
