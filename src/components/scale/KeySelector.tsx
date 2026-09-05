"use client";

import { NATURAL_KEYS } from "@/lib/music/constants";
import type { NotePC } from "@/types/music";

type Props = {
  value: NotePC;
  onChange: (key: NotePC) => void;
};

export default function KeySelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-[6px] flex-wrap">
      {NATURAL_KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={[
            "min-w-[42px] py-2 text-center rounded-full text-sm font-mono font-medium border-[1.5px] transition-all duration-[120ms] cursor-pointer",
            value === key
              ? "bg-accent-bg border-accent text-accent font-semibold"
              : "bg-surface2 border-transparent text-text-sec hover:text-text-pri hover:bg-surface3",
          ].join(" ")}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
