'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const errorMessage = await login(email, password)
    setSubmitting(false)
    if (errorMessage) {
      setError(errorMessage)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex items-center justify-center h-full">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-[14px] p-[22px] flex flex-col gap-5 w-full max-w-[360px]"
      >
        <div className="text-[20px] font-bold tracking-[-0.01em] font-jp">ログイン</div>

        <div className="flex flex-col gap-[8px]">
          <label className="text-[12px] text-text-sec font-medium font-jp">メールアドレス</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-surface2 border border-border text-text-pri text-sm font-jp px-[14px] py-[10px] rounded-[10px] outline-none focus:border-accent/60 transition-colors placeholder:text-text-mut"
          />
        </div>

        <div className="flex flex-col gap-[8px]">
          <label className="text-[12px] text-text-sec font-medium font-jp">パスワード</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-surface2 border border-border text-text-pri text-sm font-jp px-[14px] py-[10px] rounded-[10px] outline-none focus:border-accent/60 transition-colors placeholder:text-text-mut"
          />
        </div>

        {error && <div className="text-[12px] text-dim font-jp">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="text-[13px] font-medium font-jp px-[16px] py-[9px] rounded-[9px] bg-accent text-bg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          ログイン
        </button>

        <div className="text-[12px] text-text-sec font-jp text-center">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-accent hover:underline">
            新規登録
          </Link>
        </div>
      </form>
    </div>
  )
}
