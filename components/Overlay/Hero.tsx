'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/scroll'
import { useUI } from '@/store/ui'
import { useReducedMotion } from '@/hooks/use-media'
import { MaskLine } from './MaskLine'

const CHIPS = [
  { n: '457', u: 'CC' },
  { n: '2', u: 'CYL' },
  { n: '10', u: 'SYSTEMS' },
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const loaded = useUI((s) => s.loaded)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!loaded || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-mask-inner]',
        { yPercent: 110, y: 0 },
        { yPercent: 0, y: 0, duration: reduced ? 0.01 : 1.1, ease: 'power3.inOut', stagger: reduced ? 0 : 0.07 },
      )
    }, ref)
    return () => ctx.revert()
  }, [loaded, reduced])

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative flex h-svh min-h-[560px] flex-col justify-between px-[var(--gutter)] pb-[calc(var(--hud-h)+1.25rem)] pt-[calc(var(--bar-h)+2.25rem)]"
    >
      <div>
        <div className="mb-3 flex justify-between font-mono text-[10px] uppercase tracking-wider text-bone/70">
          <MaskLine>[00/10] SYS // ASSEMBLED</MaskLine>
          <MaskLine className="max-sm:hidden">UNOFFICIAL FAN PROJECT</MaskLine>
        </div>
        <h1 id="hero-title" aria-label="Aprilia RS 457" className="hero-title font-display uppercase">
          <MaskLine>APRILIA</MaskLine>
          <MaskLine className="md:pl-[9vw]">
            <span className="text-stroke">RS 457</span>
          </MaskLine>
        </h1>
        <div className="mt-4 flex items-center gap-3 md:pl-[9vw]">
          <span aria-hidden className="block size-2.5 shrink-0 bg-signal" />
          <MaskLine className="font-sans text-[clamp(0.8rem,1.3vw,1.1rem)] font-medium uppercase tracking-[0.3em]">
            Anatomy of a superbike
          </MaskLine>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <MaskLine className="font-display text-[clamp(1.5rem,3.2vw,3.25rem)] uppercase leading-none">
            <span className="text-stroke">Scroll to disassemble</span>
          </MaskLine>
          <svg aria-hidden viewBox="0 0 24 32" className="step-arrow mb-1 h-8 w-6 shrink-0 text-signal" fill="none">
            <path d="M12 2v24M3 17l9 9 9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
          </svg>
        </div>
        <ul className="flex gap-2" aria-label="Quick stats">
          {CHIPS.map((c) => (
            <li key={c.u} className="overflow-hidden">
              <MaskLine className="border border-bone/30 bg-ink px-2 py-1 font-mono text-[10px] uppercase">
                <span className="text-hud tabular-nums">{c.n}</span> {c.u}
              </MaskLine>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
