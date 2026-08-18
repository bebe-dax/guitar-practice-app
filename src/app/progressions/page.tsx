'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useProgressions } from '@/hooks/useProgressions'
import ProgressionCard from '@/components/progression/ProgressionCard'

export default function ProgressionsPage() {
  const { progressions, loading, error } = useProgressions()
  const [search, setSearch] = useState('')

  const filtered = progressions.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.chords.some(c => c.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between flex-shrink-0 pl-[52px] md:pl-0 gap-3">
        <div className="min-w-0">
          <div className="text-[20px] font-bold tracking-[-0.01em] font-jp">コード進行</div>
          <div className="text-[12px] text-text-sec mt-[3px] font-jp">保存したコード進行とフレーズ</div>
        </div>
        <Link href="/progressions/new" className="flex-shrink-0">
          <button className="text-[13px] font-medium font-jp px-[14px] md:px-[16px] py-[8px] rounded-[9px] bg-accent text-bg hover:opacity-90 transition-opacity whitespace-nowrap">
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

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-text-mut">
          <div className="text-[13px] font-jp">読み込み中...</div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-dim">
          <div className="text-[13px] font-jp">{error}</div>
        </div>
      ) : filtered.length === 0 ? (
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
        <div className="grid gap-[14px] overflow-y-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((progression, i) => (
            <ProgressionCard key={progression.id} progression={progression} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
