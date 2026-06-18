import { useState, useMemo, useEffect } from 'react'
import { getScaleNotes, getRelativeKey } from '@/lib/music/scale'
import { getDiatonicChords } from '@/lib/music/chord'
import { DEFAULT_FRET_START } from '@/lib/music/constants'
import type { NotePC, ScaleName } from '@/types/music'

const MINOR_SCALE_NAMES: ScaleName[] = ['minor', 'minor pentatonic', 'blues']
const STORAGE_KEY = 'guitar-app:scale'

type ScaleStorage = {
  key: NotePC
  scaleName: ScaleName
  fretStart: number
}

function loadScaleState(): ScaleStorage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ScaleStorage
  } catch {
    return null
  }
}

function persistScaleState(state: ScaleStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useScale() {
  const [key, setKey] = useState<NotePC>('C')
  const [scaleName, setScaleName] = useState<ScaleName>('major')
  const [fretStart, setFretStart] = useState(DEFAULT_FRET_START)

  useEffect(() => {
    const saved = loadScaleState()
    if (saved) {
      setKey(saved.key)
      setScaleName(saved.scaleName)
      setFretStart(saved.fretStart)
    }
  }, [])

  useEffect(() => {
    persistScaleState({ key, scaleName, fretStart })
  }, [key, scaleName, fretStart])

  const isMinor = MINOR_SCALE_NAMES.includes(scaleName)
  const scaleNotes = useMemo(() => getScaleNotes(key, scaleName), [key, scaleName])
  const diatonicChords = useMemo(() => getDiatonicChords(key, isMinor), [key, isMinor])

  // スケール種別が変わるときに相対調へキーを自動更新する
  // localStorage 復元時は生の setScaleName を使うため自動連動は発生しない
  function changeScale(newScale: ScaleName) {
    const wasMinor = MINOR_SCALE_NAMES.includes(scaleName)
    const willBeMinor = MINOR_SCALE_NAMES.includes(newScale)
    if (wasMinor !== willBeMinor) {
      setKey(getRelativeKey(key, willBeMinor))
    }
    setScaleName(newScale)
  }

  return { key, setKey, scaleName, setScaleName: changeScale, fretStart, setFretStart, scaleNotes, diatonicChords, isMinor }
}
