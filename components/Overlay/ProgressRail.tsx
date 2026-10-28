'use client'

import { PARTS } from '@/data/parts'
import { useScene } from '@/store/scroll'
import { progressForStage } from '@/lib/timeline'
import { scrollToProgress } from '@/lib/scroll'
import { pad } from './Frame'

export function ProgressRail() {
  const stage = useScene((s) => s.stage)
  return (
    <nav
      aria-label="Jump to system"
      className="pointer-events-auto fixed right-[var(--gutter)] top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end md:flex"
    >
      {PARTS.map((p, i) => {
        const active = stage === i
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => scrollToProgress(progressForStage(i))}
            aria-label={`Go to ${p.name}`}
            aria-current={active ? 'step' : undefined}
            className="group flex items-center gap-2 py-1.5 font-mono text-[9px] outline-none focus-visible:text-signal"
          >
            <span className={active ? 'text-signal' : 'text-bone/0 group-hover:text-bone/70'}>{pad(i + 1)}</span>
            <span
              className={`block h-[2px] transition-[width] duration-300 ease-[cubic-bezier(.76,0,.24,1)] ${
                active ? 'w-6 bg-signal' : 'w-3 bg-bone/30 group-hover:w-5 group-hover:bg-bone'
              }`}
            />
          </button>
        )
      })}
    </nav>
  )
}
