'use client'

import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768 // px (Tailwind md)

// SSR では false を返し、マウント後に media query を評価して反映する。
// 初回ハイドレーション後のみ true/false が確定する点に注意（描画は1フレーム desktop で始まりうる）。
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [breakpoint])

  return isMobile
}
