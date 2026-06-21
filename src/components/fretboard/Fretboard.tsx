'use client'

import { useMemo } from 'react'
import { getNotesOnFretboard } from '@/lib/music/fretboard'
import { SINGLE_INLAYS, DOUBLE_INLAYS, DEFAULT_FRET_WIDTH } from '@/lib/music/constants'
import type { NotePC } from '@/types/music'

const W = 1280, H = 320
const PAD_L = 52, PAD_R = 16, PAD_T = 26, PAD_B = 38
const FB_W = W - PAD_L - PAD_R
const FB_H = H - PAD_T - PAD_B
const FRET_W = FB_W / DEFAULT_FRET_WIDTH
const STRING_H = FB_H / 5

// 上(1弦=e) → 下(6弦=E)
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

type Props = {
  scaleNotes: NotePC[]
  rootNote: NotePC
  fretStart: number
}

export default function Fretboard({ scaleNotes, rootNote, fretStart }: Props) {
  const notes = useMemo(() => {
    const start = fretStart === 0 ? 0 : fretStart + 1
    return getNotesOnFretboard(scaleNotes, rootNote, start, fretStart + DEFAULT_FRET_WIDTH)
  }, [scaleNotes, rootNote, fretStart])

  const dotNotes = notes.filter(n => n.fret >= 1)
  const openNotes = fretStart === 0 ? notes.filter(n => n.fret === 0) : []

  // FretboardNote.string: 0=6弦(bottom), 5=1弦(top)
  const sy = (stringIdx: number) => PAD_T + (5 - stringIdx) * STRING_H
  const fx = (fret: number) => PAD_L + (fret - fretStart - 1) * FRET_W + FRET_W / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
      {/* 指板面 */}
      <rect
        x={PAD_L} y={PAD_T - 8}
        width={FB_W} height={FB_H + 16}
        rx={6} fill="var(--color-surface2)" opacity={0.45}
      />

      {/* フレット縦線・ナット */}
      {Array.from({ length: DEFAULT_FRET_WIDTH + 1 }, (_, f) => {
        const x = PAD_L + f * FRET_W
        const isNut = fretStart === 0 && f === 0
        return (
          <line
            key={f}
            x1={x} y1={PAD_T - 8} x2={x} y2={PAD_T + FB_H + 8}
            stroke={isNut ? 'var(--color-text-sec)' : 'var(--color-fret-wire)'}
            strokeWidth={isNut ? 7 : 2.5}
          />
        )
      })}

      {/* ポジションマーク・フレット番号 */}
      {Array.from({ length: DEFAULT_FRET_WIDTH }, (_, f) => {
        const fretNum = fretStart + f + 1
        const cx = PAD_L + f * FRET_W + FRET_W / 2
        return (
          <g key={f}>
            {(SINGLE_INLAYS as readonly number[]).includes(fretNum) && (
              <circle cx={cx} cy={PAD_T + FB_H / 2} r={6.5} fill="var(--color-surface3)" />
            )}
            {(DOUBLE_INLAYS as readonly number[]).includes(fretNum) && (
              <>
                <circle cx={cx} cy={PAD_T + FB_H * 0.28} r={6.5} fill="var(--color-surface3)" />
                <circle cx={cx} cy={PAD_T + FB_H * 0.72} r={6.5} fill="var(--color-surface3)" />
              </>
            )}
            <text
              x={cx} y={H - 10}
              fill="var(--color-text-mut)" fontSize={13}
              fontFamily="var(--font-mono)" textAnchor="middle"
            >
              {fretNum}
            </text>
          </g>
        )
      })}

      {/* 弦・弦名ラベル (s=0: 1弦top, s=5: 6弦bottom) */}
      {STRING_NAMES.map((name, s) => {
        const y = PAD_T + s * STRING_H
        return (
          <g key={s}>
            <line
              x1={PAD_L} y1={y} x2={PAD_L + FB_W} y2={y}
              stroke="var(--color-string)" strokeWidth={1 + s * 0.5} opacity={0.75}
            />
            <text
              x={PAD_L - 20} y={y + 4.5}
              fill="var(--color-text-mut)" fontSize={12.5}
              fontFamily="var(--font-mono)" textAnchor="middle"
            >
              {name}
            </text>
          </g>
        )
      })}

      {/* 音符ドット */}
      {dotNotes.map((n, i) => {
        const cx = fx(n.fret)
        const cy = sy(n.string)
        const stroke = n.isRoot ? 'var(--color-root)' : 'var(--color-note)'
        const fill = n.isRoot ? 'var(--color-root-bg)' : 'var(--color-note-bg)'
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={17} fill={fill} stroke={stroke} strokeWidth={2.2} />
            <text
              x={cx} y={cy + 4.5}
              fill={stroke} fontSize={13} fontWeight={600}
              fontFamily="var(--font-mono)" textAnchor="middle"
            >
              {n.pc}
            </text>
          </g>
        )
      })}

      {/* 開放弦インジケーター */}
      {openNotes.map((n, i) => (
        <circle
          key={i}
          cx={PAD_L - 36} cy={sy(n.string)}
          r={9} fill="none"
          stroke={n.isRoot ? 'var(--color-root)' : 'var(--color-note)'}
          strokeWidth={1.8} opacity={0.8}
        />
      ))}
    </svg>
  )
}
