'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from './Sidebar'

// サイドバー無し・未ログインでもアクセスできるページ
const PUBLIC_PATHS = ['/login', '/register']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    if (!loading && !user && !isPublicPath) {
      router.replace('/login')
    }
  }, [loading, user, isPublicPath, router])

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  // ログイン/登録ページはサイドバー無しでそのまま表示
  if (isPublicPath) {
    return <main className="flex-1 min-w-0 h-screen overflow-y-auto">{children}</main>
  }

  // 認証確認中、または未ログインでリダイレクト待ちの間はホーム画面をちらつかせない
  if (loading || !user) {
    return null
  }

  return (
    <>
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto p-[18px_16px_22px] md:p-[22px_32px_28px]">
        {children}
      </main>
    </>
  )
}
