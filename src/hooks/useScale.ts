import { useState, useMemo } from 'react'
import { getScaleNotes } from '@/lib/music/scale'
import { getDiatonicChords } from '@/lib/music/chord'
import { DEFAULT_FRET_START } from '@/lib/music/constants'
import type { NotePC, ScaleName } from '@/types/music'

const MINOR_SCALE_NAMES: ScaleName[] = ['minor', 'minor pentatonic', 'blues']

export function useScale() {
  const [key, setKey] = useState<NotePC>('C')
  const [scaleName, setScaleName] = useState<ScaleName>('major')
  const [fretStart, setFretStart] = useState(DEFAULT_FRET_START)

  const isMinor = MINOR_SCALE_NAMES.includes(scaleName)
  const scaleNotes = useMemo(() => getScaleNotes(key, scaleName), [key, scaleName])
  const diatonicChords = useMemo(() => getDiatonicChords(key, isMinor), [key, isMinor])

  return { key, setKey, scaleName, setScaleName, fretStart, setFretStart, scaleNotes, diatonicChords, isMinor }
}
