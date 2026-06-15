'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', icon: '◉', label: 'スケール & 指板' },
  { href: '/progressions', icon: '≡', label: 'コード進行' },
  { href: '/progressions/new', icon: '+', label: '新規作成' },
]

export default function Sidebar() {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()

  return (
    <>
      <aside
        className="relative flex flex-col flex-shrink-0 h-screen bg-surface border-r border-border overflow-hidden transition-[width,padding] duration-[220ms] ease-in-out"
        style={{
          width: open ? '224px' : '64px',
          padding: open ? '20px 14px' : '20px 10px',
        }}
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
          <span className={`transition-opacity duration-150 ${open ? 'opacity-100' : 'opacity-0'}`}>
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
              <span className={`transition-opacity duration-150 ${open ? 'opacity-100' : 'opacity-0'}`}>
                {label}
              </span>
            </Link>
          )
        })}

        <div className="flex-1" />

        {/* バージョン */}
        <span
          className={`text-[11px] text-text-mut px-[10px] font-mono whitespace-nowrap transition-opacity duration-150 ${open ? 'opacity-100' : 'opacity-0'}`}
        >
          v0.1.0
        </span>
      </aside>

      {/* トグルボタン */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-[18px] z-50 w-7 h-7 rounded-full bg-surface2 border border-border text-text-sec text-xs grid place-items-center hover:text-text-pri hover:bg-surface3 transition-all duration-[220ms] ease-in-out"
        style={{ left: open ? 'calc(224px - 14px)' : 'calc(64px - 14px)' }}
        title="サイドバーを開閉"
      >
        {open ? '◀' : '▶'}
      </button>
    </>
  )
}
