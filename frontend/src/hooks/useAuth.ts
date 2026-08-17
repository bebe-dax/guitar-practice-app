'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  createElement,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type AuthError,
} from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase/client'
import { offerToSavePassword } from '@/lib/auth/credentials'
import type { User } from '@/types/auth'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  register: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toErrorMessage(error: unknown): string {
  const code = (error as AuthError)?.code
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'メールアドレスまたはパスワードが正しくありません'
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に登録されています'
    case 'auth/weak-password':
      return 'パスワードは8文字以上で入力してください'
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません'
    default:
      return '通信エラーが発生しました'
  }
}

// アプリ全体で認証状態を1つだけ共有するためのProvider。
// AppShell・各ページが個別にuseAuth()を呼んでも同じ状態を参照する。
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, firebaseUser => {
      setUser(firebaseUser ? { id: firebaseUser.uid, email: firebaseUser.email ?? '' } : null)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function login(email: string, password: string): Promise<string | null> {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
      await offerToSavePassword(email, password)
      return null
    } catch (e) {
      return toErrorMessage(e)
    }
  }

  async function register(email: string, password: string): Promise<string | null> {
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password)
      await offerToSavePassword(email, password)
      return null
    } catch (e) {
      return toErrorMessage(e)
    }
  }

  async function logout(): Promise<void> {
    await signOut(firebaseAuth)
  }

  return createElement(AuthContext.Provider, { value: { user, loading, login, register, logout } }, children)
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
