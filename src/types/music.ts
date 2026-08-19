export type NotePC = string        // ピッチクラス（オクターブなし） 例: "C", "F#"
export type NoteWithOct = string   // オクターブあり 例: "C4", "A3"
export type ScaleName = 'major' | 'minor' | 'major pentatonic' | 'minor pentatonic' | 'blues'
export type ChordName = string     // 例: "Am7", "Cmaj7"

// スケール度数つきダイアトニックコード（例: { chord: 'Cmaj7', degree: 'I' }）
// キー（長調/短調）のみで決まり、常に7つ返る
export type DiatonicChord = {
  chord: ChordName
  degree: string
}
