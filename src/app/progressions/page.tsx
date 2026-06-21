'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useProgressions } from '@/hooks/useProgressions'
import ProgressionCard from '@/components/progression/ProgressionCard'

export default function ProgressionsPage() {
  const { progressions } = useProgressions()
  const [search, setSearch] = useState('')

  const filtered = progressions.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.chords.some(c => c.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[20px] font-bold tracking-[-0.01em] font-jp">コード進行</div>
          <div className="text-[12px] text-text-sec mt-[3px] font-jp">保存したコード進行とフレーズ</div>
        </div>
        <Link href="/progressions/new">
          <button className="text-[13px] font-medium font-jp px-[16px] py-[8px] rounded-[9px] bg-accent text-bg hover:opacity-90 transition-opacity">
            + 新規作成
          </button>
        </Link>
      </div>

      <div className="flex gap-3 items-center flex-shrink-0">
        <input
          type="text"
          placeholder="タイトル・コードで検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-[420px] text-[13px] font-jp px-[14px] py-[9px] rounded-[9px] bg-surface border border-border text-text-pri placeholder:text-text-mut outline-none focus:border-accent/60 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-mut">
          <div className="text-[40px]">♩</div>
          <div className="text-[14px] font-jp">
            {search ? '検索結果がありません' : 'コード進行がまだありません'}
          </div>
          {!search && (
            <Link href="/progressions/new">
              <span className="text-[13px] text-accent hover:underline cursor-pointer font-jp">
                最初のコード進行を作成する →
              </span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-[14px] overflow-y-auto" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {filtered.map((progression, i) => (
            <ProgressionCard key={progression.id} progression={progression} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
