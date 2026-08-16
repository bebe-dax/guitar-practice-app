'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@/types/auth'

const NAV_ITEMS = [
  { href: '/', icon: '◉', label: 'スケール & 指板' },
  { href: '/progressions', icon: '≡', label: 'コード進行' },
  { href: '/progressions/new', icon: '+', label: '新規作成' },
]

const MOBILE_BREAKPOINT = 768 // px (= Tailwind md)

type Props = {
  user: User
  onLogout: () => void
}

export default function Sidebar({ user, onLogout }: Props) {
  const pathname = usePathname()
  // mobile: ドロワーの開閉、desktop: ワイド/ナロー の開閉、共通の boolean
  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const apply = () => {
      setIsMobile(mq.matches)
      // モバイル切替時は閉じておく（オフキャンバスのデフォルト）
      setOpen(!mq.matches)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // ルート遷移時はモバイルではドロワーを閉じる
  useEffect(() => {
    if (isMobile) setOpen(false)
  }, [pathname, isMobile])

  // PC ワイド/ナロー幅、モバイルはフルワイドのドロワー
  const desktopWidth = open ? 224 : 64
  const mobileWidth = 248

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isMobile && open && (
        <button
          aria-label="サイドバーを閉じる"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40"
        />
      )}

      <aside
        className={[
          'flex flex-col bg-surface border-r border-border overflow-hidden transition-[width,transform,padding] duration-[220ms] ease-in-out',
          isMobile
            ? 'fixed inset-y-0 left-0 z-40 h-screen'
            : 'relative flex-shrink-0 h-screen',
        ].join(' ')}
        style={
          isMobile
            ? {
                width: `${mobileWidth}px`,
                padding: '20px 14px',
                transform: open ? 'translateX(0)' : `translateX(-${mobileWidth}px)`,
              }
            : {
                width: `${desktopWidth}px`,
                padding: open ? '20px 14px' : '20px 10px',
              }
        }
      >
        {/* ロゴ */}
        <div className="flex items-center gap-[9px] font-bold text-[17px] tracking-tight pb-5 px-[6px] whitespace-nowrap">
          <span
            className="w-[30px] h-[30px] flex-shrink-0 rounded-[8px] grid place-items-center text-[15px]"
            style={{
              background: 'linear-gradient(135deg, var(--color-root), var(--color-amber))',
              color: '#1a1208',
            }}
          >
            ♪
          </span>
          <span
            className={`transition-opacity duration-150 ${
              isMobile || open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Guitar Practice
          </span>
        </div>

        {/* ナビゲーション */}
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-[11px] py-[10px] rounded-[9px] text-sm border whitespace-nowrap overflow-hidden transition-all duration-150 font-jp',
                isActive
                  ? 'bg-accent-bg border-accent/40 text-accent font-medium'
                  : 'border-transparent text-text-sec hover:bg-surface2 hover:text-text-pri',
              ].join(' ')}
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0 font-ui">{icon}</span>
              <span
                className={`transition-opacity duration-150 ${
                  isMobile || open ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}

        <div className="flex-1" />

        {/* 認証状態 */}
        <div className="px-[6px] pb-2 border-t border-border pt-3">
          <div className="flex flex-col gap-[6px]">
            <div
              className={`text-[11px] text-text-mut truncate whitespace-nowrap px-[11px] transition-opacity duration-150 ${
                isMobile || open ? 'opacity-100' : 'opacity-0'
              }`}
              title={user.email}
            >
              {user.email}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-[11px] py-[10px] rounded-[9px] text-sm border border-transparent text-text-sec hover:bg-surface2 hover:text-text-pri whitespace-nowrap overflow-hidden transition-all duration-150 font-jp"
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0 font-ui">⎋</span>
              <span
                className={`transition-opacity duration-150 ${
                  isMobile || open ? 'opacity-100' : 'opacity-0'
                }`}
              >
                ログアウト
              </span>
            </button>
          </div>
        </div>

        {/* バージョン */}
        <span
          className={`text-[11px] text-text-mut px-[10px] font-mono whitespace-nowrap transition-opacity duration-150 ${
            isMobile || open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          v0.1.0
        </span>
      </aside>

      {/* トグルボタン */}
      {isMobile ? (
        // モバイル: 左上に固定のハンバーガー（ドロワー閉のときのみ表示）
        !open && (
          <button
            onClick={() => setOpen(true)}
            aria-label="サイドバーを開く"
            className="fixed top-[14px] left-[14px] z-50 w-9 h-9 rounded-[10px] bg-surface2 border border-border text-text-pri grid place-items-center hover:bg-surface3 transition-colors"
          >
            <span className="flex flex-col gap-[3px]">
              <span className="block w-[16px] h-[1.5px] bg-current rounded-full" />
              <span className="block w-[16px] h-[1.5px] bg-current rounded-full" />
              <span className="block w-[16px] h-[1.5px] bg-current rounded-full" />
            </span>
          </button>
        )
      ) : (
        // デスクトップ: 既存の縁トグル
        <button
          onClick={() => setOpen(o => !o)}
          className="fixed top-[18px] z-50 w-7 h-7 rounded-full bg-surface2 border border-border text-text-sec text-xs grid place-items-center hover:text-text-pri hover:bg-surface3 transition-all duration-[220ms] ease-in-out"
          style={{ left: open ? 'calc(224px - 14px)' : 'calc(64px - 14px)' }}
          title="サイドバーを開閉"
        >
          {open ? '◀' : '▶'}
        </button>
      )}
    </>
  )
}
