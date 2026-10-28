'use client'

import { useEffect, useRef } from 'react'
import { PART_BY_ID, PART_INDEX } from '@/data/parts'
import { useScene } from '@/store/scroll'
import { useFinePointer } from '@/hooks/use-media'
import { pad } from './Frame'

export function HoverLabel() {
  const hovered = useScene((s) => s.hovered)
  const selected = useScene((s) => s.selected)
  const fine = useFinePointer()
  const ref = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (ref.current) ref.current.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  if (!fine || !hovered) return null
  const part = PART_BY_ID[hovered]
  const { x, y } = pos.current

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 flex items-center gap-2 whitespace-nowrap bg-signal px-2 py-1 font-mono text-[10px] font-bold uppercase text-ink"
      style={{ transform: `translate3d(${x + 18}px, ${y + 18}px, 0)` }}
    >
      <span>[{pad(PART_INDEX[hovered] + 1)}]</span>
      <span>{part.name}</span>
      <span className="font-normal">// {selected === hovered ? 'CLICK TO RELEASE' : 'CLICK TO LOCK'}</span>
    </div>
  )
}
