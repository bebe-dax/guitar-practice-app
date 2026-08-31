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
import type { ProgressionItem } from '@/types/progression'

// 組み込みの Omit は union の keyof を共通キーへ縮退させてしまうため、
// type別のフィールド（chords/notes）を保持できるよう分配的に定義する
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export type ProgressionItemInput = DistributiveOmit<ProgressionItem, 'id' | 'createdAt' | 'updatedAt'>

const COLLECTION = 'progressions'

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid
  if (!uid) throw new Error('ログインが必要です')
  return uid
}

// Firestore SDKを直接叩けばアプリの型を経由せず任意の形のドキュメントを
// 書き込めるため、想定外の形のフィールドが混ざっていないか実行時に検証する
function isValidBaseData(data: DocumentData): boolean {
  return (
    typeof data.title === 'string' &&
    typeof data.key === 'string' &&
    typeof data.scale === 'string' &&
    typeof data.memo === 'string' &&
    data.createdAt instanceof Timestamp &&
    data.updatedAt instanceof Timestamp
  )
}

function toProgressionItem(id: string, data: DocumentData): ProgressionItem | null {
  if (!isValidBaseData(data)) return null

  const base = {
    id,
    title: data.title,
    key: data.key,
    scale: data.scale,
    memo: data.memo,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  }

  if (data.type === 'phrase') {
    if (!Array.isArray(data.notes)) return null
    return { ...base, type: 'phrase', notes: data.notes }
  }

  // type未設定の既存ドキュメント（フレーズ機能導入前に保存されたもの）は progression として扱う
  if (!Array.isArray(data.chords)) return null
  return { ...base, type: 'progression', chords: data.chords }
}

export async function listProgressions(): Promise<ProgressionItem[]> {
  const uid = requireUid()
  const q = query(collection(firestore, COLLECTION), where('userId', '==', uid), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  // 不正な形式のドキュメントが1件混ざっていても、他の正常なドキュメントの
  // 表示に影響しないようスキップする
  return snapshot.docs
    .map(d => toProgressionItem(d.id, d.data()))
    .filter((p): p is ProgressionItem => p !== null)
}

export async function createProgression(data: ProgressionItemInput): Promise<ProgressionItem> {
  const uid = requireUid()
  const ref = await addDoc(collection(firestore, COLLECTION), {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  const snapshot = await getDocFromServer(ref)
  const item = toProgressionItem(snapshot.id, snapshot.data()!)
  if (!item) throw new Error('作成したデータの取得に失敗しました')
  return item
}

export async function updateProgression(id: string, data: ProgressionItemInput): Promise<ProgressionItem> {
  const ref = doc(firestore, COLLECTION, id)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  const snapshot = await getDocFromServer(ref)
  const item = toProgressionItem(snapshot.id, snapshot.data()!)
  if (!item) throw new Error('更新したデータの取得に失敗しました')
  return item
}

export async function deleteProgression(id: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTION, id))
}
