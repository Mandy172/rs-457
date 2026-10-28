'use client'

import { useEffect, useRef } from 'react'
import { live } from '@/store/scroll'
import { useUI } from '@/store/ui'
import { useEngineAudio } from './useEngineAudio'

const SEGMENTS = 24

export function Hud() {
  useEngineAudio()
  const muted = useUI((s) => s.muted)
  const toggleMuted = useUI((s) => s.toggleMuted)
  const setRevHeld = useUI((s) => s.setRevHeld)
  const revHeld = useUI((s) => s.revHeld)
  const rpmRef = useRef<HTMLSpanElement>(null)
  const progRef = useRef<HTMLSpanElement>(null)
  const segRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isTyping(e.target)) return
      e.preventDefault()
      if (!e.repeat) setRevHeld(true)
    }
    const up = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      setRevHeld(false)
    }
    const release = () => setRevHeld(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', release)
    }
  }, [setRevHeld])

  useEffect(() => {
    let raf = 0
    let lastLit = -1
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (rpmRef.current) rpmRef.current.textContent = String(Math.round(live.rpm / 10) * 10).padStart(5, '0')
      if (progRef.current) progRef.current.textContent = String(Math.round(live.progress * 100)).padStart(3, '0')
      const lit = Math.round((0.06 + live.rev * 0.94) * SEGMENTS)
      if (lit === lastLit) return
      lastLit = lit
      segRefs.current.forEach((seg, i) => {
        if (!seg) return
        const on = i < lit
        const redline = i >= SEGMENTS - 4
        seg.style.backgroundColor = on ? (redline ? '#e10600' : '#d4ff00') : 'transparent'
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex h-[var(--hud-h)] items-stretch border-t border-bone/15 bg-ink font-mono text-[10px] uppercase">
      <button
        type="button"
        aria-label="Hold to rev the engine (or hold space)"
        aria-pressed={revHeld}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setRevHeld(true)
        }}
        onPointerUp={() => setRevHeld(false)}
        onPointerCancel={() => setRevHeld(false)}
        onLostPointerCapture={() => setRevHeld(false)}
        onContextMenu={(e) => e.preventDefault()}
        className={`flex w-[clamp(118px,15vw,210px)] shrink-0 touch-none select-none flex-col items-start justify-center px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bone ${
          revHeld ? 'bg-bone text-ink' : 'bg-signal text-ink'
        }`}
      >
        <span className="font-display text-[clamp(1rem,1.6vw,1.4rem)] leading-none">HOLD TO REV</span>
        <span className="mt-1 text-[9px] font-bold tracking-wider max-sm:hidden">[SPACE]</span>
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-3 md:px-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-bone/50">TACH // SIM</span>
          <span className="tabular-nums">
            <span ref={rpmRef} className="text-[13px] font-bold text-hud">
              01400
            </span>{' '}
            <span className="text-bone/50">RPM</span>
          </span>
        </div>
        <div className="flex h-2.5 gap-[2px]" aria-hidden>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              ref={(n) => {
                segRefs.current[i] = n
              }}
              className={`min-w-0 flex-1 border ${i >= SEGMENTS - 4 ? 'border-signal/60' : 'border-bone/20'}`}
            />
          ))}
        </div>
      </div>

      <div className="hidden items-center gap-2 border-l border-bone/15 px-4 md:flex">
        <span className="text-bone/50">SCAN</span>
        <span className="tabular-nums">
          <span ref={progRef} className="text-[13px] font-bold text-hud">
            000
          </span>
          <span className="text-bone/50">%</span>
        </span>
      </div>

      <button
        type="button"
        onClick={toggleMuted}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute engine sound' : 'Mute engine sound'}
        className="flex shrink-0 items-center gap-2 border-l border-bone/15 px-3 outline-none hover:bg-bone hover:text-ink focus-visible:bg-bone focus-visible:text-ink md:px-4"
      >
        <span aria-hidden className={`block size-2 ${muted ? 'border border-bone/60' : 'bg-signal'}`} />
        SND {muted ? 'OFF' : 'ON'}
      </button>
    </div>
  )
}
