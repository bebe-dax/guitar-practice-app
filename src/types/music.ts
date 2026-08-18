export type NotePC = string        // ピッチクラス（オクターブなし） 例: "C", "F#"
export type NoteWithOct = string   // オクターブあり 例: "C4", "A3"
export type ScaleName = 'major' | 'minor' | 'major pentatonic' | 'minor pentatonic' | 'blues'
export type ChordName = string     // 例: "Am7", "Cmaj7"

// スケール度数つきダイアトニックコード（例: { chord: 'Cmaj7', degree: 'I' }）
// pentatonic/blues のように 5〜6 個になるスケールでは、親キーの該当度数を継承する
export type DiatonicChord = {
  chord: ChordName
  degree: string
}
