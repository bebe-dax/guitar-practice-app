export type NotePC = string        // ピッチクラス（オクターブなし） 例: "C", "F#"
export type NoteWithOct = string   // オクターブあり 例: "C4", "A3"
export type ScaleName = 'major' | 'minor' | 'major pentatonic' | 'minor pentatonic' | 'blues'
export type ChordName = string     // 例: "Am7", "Cmaj7"
