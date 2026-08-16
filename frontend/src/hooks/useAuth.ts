'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  createElement,
  type ReactNode,
} from 'react'
import { apiFetch, ApiError } from '@/lib/api/client'
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

// アプリ全体で認証状態を1つだけ共有するためのProvider。
// AppShell・各ページが個別にuseAuth()を呼んでも同じ状態を参照する。
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const me = await apiFetch<User>('/api/auth/me')
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  async function login(email: string, password: string): Promise<string | null> {
    try {
      const me = await apiFetch<User>('/api/auth/login', { method: 'POST', body: { email, password } })
      setUser(me)
      await offerToSavePassword(email, password)
      return null
    } catch (e) {
      return e instanceof ApiError ? e.message : '通信エラーが発生しました'
    }
  }

  async function register(email: string, password: string): Promise<string | null> {
    try {
      const me = await apiFetch<User>('/api/auth/register', { method: 'POST', body: { email, password } })
      setUser(me)
      await offerToSavePassword(email, password)
      return null
    } catch (e) {
      return e instanceof ApiError ? e.message : '通信エラーが発生しました'
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiFetch<void>('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
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
