'use client'

import { PARTS } from '@/data/parts'
import { useScene } from '@/store/scroll'

export const pad = (n: number) => String(n).padStart(2, '0')

export function indexTag(stage: number) {
  const n = stage < 0 ? 0 : Math.min(stage + 1, PARTS.length)
  return `[${pad(n)}/${pad(PARTS.length)}]`
}

function TopBar() {
  const stage = useScene((s) => s.stage)
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--bar-h)] items-center justify-between bg-signal px-[var(--gutter)] font-mono text-[10px] uppercase leading-none tracking-wider text-ink">
      <span className="font-bold">RS457 // ANATOMY</span>
      <span className="absolute left-1/2 -translate-x-1/2 font-bold tracking-[0.7em] max-sm:hidden" aria-label="Aprilia">
        APRILIA
      </span>
      <span className="tabular-nums" aria-live="polite">
        {indexTag(stage)}
      </span>
    </header>
  )
}

function GridLines() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] px-[var(--gutter)]">
      <div className="grid h-full grid-cols-4 border-r border-bone/[0.06] md:grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={`border-l border-bone/[0.06] ${i >= 4 ? 'max-md:hidden' : ''}`} />
        ))}
      </div>
    </div>
  )
}

function Crosshairs() {
  const base = 'fixed z-[2] font-mono text-sm leading-none text-bone/50'
  return (
    <div aria-hidden className="pointer-events-none">
      <span className={`${base} left-[calc(var(--gutter)-0.3em)] top-[calc(var(--bar-h)+10px)]`}>+</span>
      <span className={`${base} right-[calc(var(--gutter)-0.3em)] top-[calc(var(--bar-h)+10px)]`}>+</span>
      <span className={`${base} bottom-[calc(var(--hud-h)+10px)] left-[calc(var(--gutter)-0.3em)]`}>+</span>
      <span className={`${base} bottom-[calc(var(--hud-h)+10px)] right-[calc(var(--gutter)-0.3em)]`}>+</span>
    </div>
  )
}

export function Frame() {
  return (
    <>
      <TopBar />
      <GridLines />
      <Crosshairs />
      <div aria-hidden className="pointer-events-none fixed -inset-[10%] z-[90] opacity-[0.07] grain" />
    </>
  )
}

export function Hazard({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`hazard h-2 w-full ${className}`} />
}
