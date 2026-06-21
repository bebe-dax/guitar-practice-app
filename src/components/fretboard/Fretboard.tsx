'use client'

import { useMemo } from 'react'
import { getNotesOnFretboard } from '@/lib/music/fretboard'
import { SINGLE_INLAYS, DOUBLE_INLAYS, DEFAULT_FRET_WIDTH, MOBILE_FRET_WIDTH } from '@/lib/music/constants'
import type { NotePC } from '@/types/music'

// SVG は親コンテナに完全フィット（スクロール無し）。
// フレット数が少ない（モバイル）モードでは viewBox を縦に伸ばし、
// 各要素を大きくして小さい表示でも可読性を確保する。
const FRET_W = 101 // viewBox units per fret（12-fret時の (1280-PAD_L-PAD_R)/12 を踏襲）
const PAD_L = 52
const PAD_R = 16

type Config = {
  H: number
  PAD_T: number
  PAD_B: number
  DOT_R: number
  DOT_FONT: number
  FRET_NUM_FONT: number
  STRING_LABEL_FONT: number
  STRING_LABEL_OFFSET: number
  OPEN_R: number
  OPEN_X_OFFSET: number
  INLAY_R: number
}

const CONFIG_FULL: Config = {
  H: 320, PAD_T: 26, PAD_B: 38,
  DOT_R: 17, DOT_FONT: 13,
  FRET_NUM_FONT: 13,
  STRING_LABEL_FONT: 12.5, STRING_LABEL_OFFSET: 20,
  OPEN_R: 9, OPEN_X_OFFSET: 36, INLAY_R: 6.5,
}

const CONFIG_COMPACT: Config = {
  H: 480, PAD_T: 36, PAD_B: 50,
  DOT_R: 28, DOT_FONT: 22,
  FRET_NUM_FONT: 22,
  STRING_LABEL_FONT: 20, STRING_LABEL_OFFSET: 28,
  OPEN_R: 14, OPEN_X_OFFSET: 42, INLAY_R: 10,
}

// 上(1弦=e) → 下(6弦=E)
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

type Props = {
  scaleNotes: NotePC[]
  rootNote: NotePC
  fretStart: number
  fretWidth?: number
}

export default function Fretboard({ scaleNotes, rootNote, fretStart, fretWidth = DEFAULT_FRET_WIDTH }: Props) {
  const cfg = fretWidth <= MOBILE_FRET_WIDTH ? CONFIG_COMPACT : CONFIG_FULL
  const FB_W = FRET_W * fretWidth
  const FB_H = cfg.H - cfg.PAD_T - cfg.PAD_B
  const STRING_H = FB_H / 5
  const W = PAD_L + FB_W + PAD_R
  const H = cfg.H

  const notes = useMemo(() => {
    const start = fretStart === 0 ? 0 : fretStart + 1
    return getNotesOnFretboard(scaleNotes, rootNote, start, fretStart + fretWidth)
  }, [scaleNotes, rootNote, fretStart, fretWidth])

  const dotNotes = notes.filter(n => n.fret >= 1)
  const openNotes = fretStart === 0 ? notes.filter(n => n.fret === 0) : []

  // FretboardNote.string: 0=6弦(bottom), 5=1弦(top)
  const sy = (stringIdx: number) => cfg.PAD_T + (5 - stringIdx) * STRING_H
  const fx = (fret: number) => PAD_L + (fret - fretStart - 1) * FRET_W + FRET_W / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full max-w-none">
      {/* 指板面 */}
      <rect
        x={PAD_L} y={cfg.PAD_T - 8}
        width={FB_W} height={FB_H + 16}
        rx={6} fill="var(--color-surface2)" opacity={0.45}
      />

      {/* フレット縦線・ナット */}
      {Array.from({ length: fretWidth + 1 }, (_, f) => {
        const x = PAD_L + f * FRET_W
        const isNut = fretStart === 0 && f === 0
        return (
          <line
            key={f}
            x1={x} y1={cfg.PAD_T - 8} x2={x} y2={cfg.PAD_T + FB_H + 8}
            stroke={isNut ? 'var(--color-text-sec)' : 'var(--color-fret-wire)'}
            strokeWidth={isNut ? 7 : 2.5}
          />
        )
      })}

      {/* ポジションマーク・フレット番号 */}
      {Array.from({ length: fretWidth }, (_, f) => {
        const fretNum = fretStart + f + 1
        const cx = PAD_L + f * FRET_W + FRET_W / 2
        return (
          <g key={f}>
            {(SINGLE_INLAYS as readonly number[]).includes(fretNum) && (
              <circle cx={cx} cy={cfg.PAD_T + FB_H / 2} r={cfg.INLAY_R} fill="var(--color-surface3)" />
            )}
            {(DOUBLE_INLAYS as readonly number[]).includes(fretNum) && (
              <>
                <circle cx={cx} cy={cfg.PAD_T + FB_H * 0.28} r={cfg.INLAY_R} fill="var(--color-surface3)" />
                <circle cx={cx} cy={cfg.PAD_T + FB_H * 0.72} r={cfg.INLAY_R} fill="var(--color-surface3)" />
              </>
            )}
            <text
              x={cx} y={H - 10}
              fill="var(--color-text-mut)" fontSize={cfg.FRET_NUM_FONT}
              fontFamily="var(--font-mono)" textAnchor="middle"
            >
              {fretNum}
            </text>
          </g>
        )
      })}

      {/* 弦・弦名ラベル (s=0: 1弦top, s=5: 6弦bottom) */}
      {STRING_NAMES.map((name, s) => {
        const y = cfg.PAD_T + s * STRING_H
        return (
          <g key={s}>
            <line
              x1={PAD_L} y1={y} x2={PAD_L + FB_W} y2={y}
              stroke="var(--color-string)" strokeWidth={1 + s * 0.5} opacity={0.75}
            />
            <text
              x={PAD_L - cfg.STRING_LABEL_OFFSET} y={y + 4.5}
              fill="var(--color-text-mut)" fontSize={cfg.STRING_LABEL_FONT}
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
            <circle cx={cx} cy={cy} r={cfg.DOT_R} fill={fill} stroke={stroke} strokeWidth={2.2} />
            <text
              x={cx} y={cy + cfg.DOT_FONT * 0.35}
              fill={stroke} fontSize={cfg.DOT_FONT} fontWeight={600}
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
          cx={PAD_L - cfg.OPEN_X_OFFSET} cy={sy(n.string)}
          r={cfg.OPEN_R} fill="none"
          stroke={n.isRoot ? 'var(--color-root)' : 'var(--color-note)'}
          strokeWidth={1.8} opacity={0.8}
        />
      ))}
    </svg>
  )
}
