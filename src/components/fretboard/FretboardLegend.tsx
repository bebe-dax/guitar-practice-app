export default function FretboardLegend() {
  return (
    <div className="flex gap-[14px] text-[11px] text-text-mut font-jp items-center whitespace-nowrap">
      <span className="flex items-center gap-[5px]">
        <span className="inline-block w-[10px] h-[10px] rounded-full border-[1.5px] border-root bg-root-bg" />
        ルート音
      </span>
      <span className="flex items-center gap-[5px]">
        <span className="inline-block w-[10px] h-[10px] rounded-full border-[1.5px] border-note bg-note-bg" />
        構成音
      </span>
    </div>
  )
}
