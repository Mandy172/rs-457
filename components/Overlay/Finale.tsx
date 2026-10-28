'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, scrollToProgress } from '@/lib/scroll'
import { useReducedMotion } from '@/hooks/use-media'
import { MaskLine } from './MaskLine'
import { Hazard } from './Frame'

const CTA = 'Disassemble again ↑'

export function Finale({ hasModel }: { hasModel: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true }).fromTo(
        '[data-mask-inner]',
        { yPercent: 110, y: 0 },
        { yPercent: 0, y: 0, duration: reduced ? 0.01 : 1, ease: 'power3.inOut', stagger: reduced ? 0 : 0.08 },
      )
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      })
    }, el)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={ref}
      aria-labelledby="finale-title"
      className="relative flex h-svh min-h-[560px] flex-col justify-between px-[var(--gutter)] pb-[calc(var(--hud-h)+1rem)] pt-[calc(var(--bar-h)+2rem)]"
    >
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-bone/70">
          <MaskLine>[10/10] SYS // REASSEMBLED</MaskLine>
        </p>
        <h2 id="finale-title" className="font-display text-[clamp(3.25rem,11vw,12.5rem)] uppercase leading-[0.86]">
          <MaskLine>10 systems.</MaskLine>
          <MaskLine className="md:pl-[9vw]">
            <span className="text-stroke-signal">One machine.</span>
          </MaskLine>
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <button
            type="button"
            onClick={() => scrollToProgress(0)}
            className="group pointer-events-auto relative border border-bone px-6 py-4 font-display text-[clamp(1.5rem,3vw,2.75rem)] uppercase leading-none outline-none focus-visible:ring-2 focus-visible:ring-signal md:px-8 md:py-5"
          >
            <span>{CTA}</span>
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-bone text-ink [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:[clip-path:inset(0_0_0_0)]"
            >
              {CTA}
            </span>
          </button>
          <p className="max-w-[28ch] font-mono text-[10px] uppercase leading-relaxed text-bone/60">
            Scroll back up or hit the button to tear it down one more time.
          </p>
        </div>

        <Hazard />

        <footer className="flex flex-wrap justify-between gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-bone/60">
          <span>Unofficial fan project. Not affiliated with Aprilia.</span>
          {hasModel && <span>3D model: Aprilia RS 660 (2024) by Kenny3D89 on Sketchfab</span>}
          <span>All specs marked TODO are placeholders.</span>
        </footer>
      </div>
    </section>
  )
}
