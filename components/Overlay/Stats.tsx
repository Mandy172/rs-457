'use client'

import { useLayoutEffect, useRef } from 'react'
import { ENGINE_STATS, PART_INDEX } from '@/data/parts'
import { useScene } from '@/store/scroll'
import { useUI } from '@/store/ui'
import { gsap } from '@/lib/scroll'
import { useReducedMotion } from '@/hooks/use-media'

const ENGINE = PART_INDEX.engine

export function Stats() {
  const stage = useScene((s) => s.stage)
  const selected = useScene((s) => s.selected)
  const loaded = useUI((s) => s.loaded)
  const reduced = useReducedMotion()
  const visible = loaded && stage === ENGINE && (!selected || selected === 'engine')
  const ref = useRef<HTMLDivElement>(null)
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])

  useLayoutEffect(() => {
    const el = ref.current
    if (!visible || !el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: reduced ? 0.01 : 0.55, ease: 'power3.inOut' },
      )
      ENGINE_STATS.forEach((s, i) => {
        const node = numRefs.current[i]
        if (!node || s.todo) return
        const counter = { v: 0 }
        gsap.to(counter, {
          v: s.value,
          duration: reduced ? 0.01 : 1.3,
          delay: reduced ? 0 : 0.2 + i * 0.12,
          ease: 'power3.inOut',
          onUpdate: () => {
            node.textContent = String(Math.round(counter.v)).padStart(String(s.value).length, '0')
          },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [visible, reduced])

  if (!visible) return null

  return (
    <div
      ref={ref}
      aria-label="Engine figures"
      className="pointer-events-none fixed left-[var(--gutter)] top-[calc(var(--bar-h)+1.75rem)] z-20 flex gap-[clamp(1rem,3vw,3rem)]"
      style={{ clipPath: 'inset(0% 0% 100% 0%)' }}
    >
      {ENGINE_STATS.map((s, i) => (
        <div key={s.label} className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-bone/60">
            [{s.label}]{s.todo && <span className="ml-1 text-signal">TODO</span>}
          </span>
          <span className="font-display text-[clamp(2.75rem,8vw,8.5rem)] leading-[0.85]">
            {s.todo ? (
              <span className="text-stroke">TBD</span>
            ) : (
              <span
                ref={(n) => {
                  numRefs.current[i] = n
                }}
                className="text-hud tabular-nums"
              >
                {'0'.repeat(String(s.value).length)}
              </span>
            )}
            <span className="ml-1 text-[0.32em] text-bone">{s.suffix}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
