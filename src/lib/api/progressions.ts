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
  type DocumentData,
  type Timestamp,
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

function toProgression(id: string, data: DocumentData): Progression {
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
  return snapshot.docs.map(d => toProgression(d.id, d.data()))
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
  return toProgression(snapshot.id, snapshot.data()!)
}

export async function updateProgression(id: string, data: ProgressionInput): Promise<Progression> {
  const ref = doc(firestore, COLLECTION, id)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  const snapshot = await getDocFromServer(ref)
  return toProgression(snapshot.id, snapshot.data()!)
}

export async function deleteProgression(id: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTION, id))
}
