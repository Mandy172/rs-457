'use client'

import { useEffect, useRef, useState } from 'react'
import { PARTS } from '@/data/parts'
import { useScene } from '@/store/scroll'
import { useUI } from '@/store/ui'
import { gsap } from '@/lib/scroll'
import { useReducedMotion } from '@/hooks/use-media'
import { pad } from './Frame'

const MIN_DURATION = 1700
const FAILSAFE = 8000

export function Loader() {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    let finished = false
    const tick = () => {
      const elapsed = performance.now() - start
      const timed = Math.min(1, elapsed / MIN_DURATION)
      const { sceneReady, loadProgress } = useScene.getState()
      const ready = sceneReady || elapsed > FAILSAFE
      const value = ready ? timed : Math.min(timed, 0.6 + 0.3 * (loadProgress / 100))
      setPct(Math.floor(value * 100))
      if (value >= 1 && !finished) {
        finished = true
        const el = ref.current
        if (!el) return
        window.setTimeout(() => useUI.getState().setLoaded(), reduced ? 0 : 380)
        gsap.to(el, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: reduced ? 0.01 : 0.95,
          delay: 0.12,
          ease: 'power3.inOut',
          onComplete: () => setDone(true),
        })
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  if (done) return null

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${pct} percent`}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink px-[var(--gutter)] pb-6 pt-6 [clip-path:inset(0%_0%_0%_0%)]"
    >
      <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-wider text-bone/70">
        <span>RS457 // ANATOMY — INITIALISING</span>
        <span>UNOFFICIAL FAN PROJECT</span>
      </div>

      <div className="flex items-end justify-between gap-6">
        <p aria-hidden className="font-display text-[clamp(7rem,34vw,30rem)] leading-[0.78] text-signal tabular-nums">
          {pad(pct)}
          <span className="text-[0.35em]">%</span>
        </p>
        <ul aria-hidden className="mb-3 hidden flex-col gap-1 font-mono text-[10px] uppercase md:flex">
          {PARTS.map((p, i) => {
            const ok = pct >= ((i + 1) / PARTS.length) * 100 - 1
            return (
              <li key={p.id} className={ok ? 'text-bone' : 'text-bone/25'}>
                [{ok ? 'OK' : '..'}] {pad(i + 1)} {p.name}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative h-3 w-full border border-bone/20">
          <div className="hazard absolute inset-y-0 left-0" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between font-mono text-[10px] uppercase text-bone/60">
          <span>LOADING ASSEMBLY</span>
          <span>{PARTS.length} SYSTEMS</span>
        </div>
      </div>
    </div>
  )
}
