import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { firestore, firebaseAuth } from '@/lib/firebase/client'
import type { Progression } from '@/types/progression'

type ProgressionInput = Omit<Progression, 'id' | 'createdAt' | 'updatedAt'>

const COLLECTION = 'progressions'

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid
  if (!uid) throw new Error('ログインが必要です')
  return uid
}

// Firestore SDKを直接叩けばアプリの型を経由せず任意の形のドキュメントを
// 書き込めるため、想定外の形のフィールドが混ざっていないか実行時に検証する
function isValidProgressionData(data: DocumentData): boolean {
  return (
    typeof data.title === 'string' &&
    typeof data.key === 'string' &&
    typeof data.scale === 'string' &&
    Array.isArray(data.chords) &&
    typeof data.memo === 'string' &&
    data.createdAt instanceof Timestamp &&
    data.updatedAt instanceof Timestamp
  )
}

function toProgression(id: string, data: DocumentData): Progression | null {
  if (!isValidProgressionData(data)) return null
  return {
    id,
    title: data.title,
    key: data.key,
    scale: data.scale,
    chords: data.chords,
    memo: data.memo,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  }
}

export async function listProgressions(): Promise<Progression[]> {
  const uid = requireUid()
  const q = query(collection(firestore, COLLECTION), where('userId', '==', uid), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  // 不正な形式のドキュメントが1件混ざっていても、他の正常なドキュメントの
  // 表示に影響しないようスキップする
  return snapshot.docs
    .map(d => toProgression(d.id, d.data()))
    .filter((p): p is Progression => p !== null)
}

export async function createProgression(data: ProgressionInput): Promise<Progression> {
  const uid = requireUid()
  const ref = await addDoc(collection(firestore, COLLECTION), {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  const snapshot = await getDocFromServer(ref)
  const progression = toProgression(snapshot.id, snapshot.data()!)
  if (!progression) throw new Error('作成したコード進行の取得に失敗しました')
  return progression
}

export async function updateProgression(id: string, data: ProgressionInput): Promise<Progression> {
  const ref = doc(firestore, COLLECTION, id)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  const snapshot = await getDocFromServer(ref)
  const progression = toProgression(snapshot.id, snapshot.data()!)
  if (!progression) throw new Error('更新したコード進行の取得に失敗しました')
  return progression
}

export async function deleteProgression(id: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTION, id))
}
