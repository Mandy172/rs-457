'use client'

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { PARTS, PART_BY_ID, PART_INDEX, type Part, type PartId } from '@/data/parts'
import { useScene } from '@/store/scroll'
import { useUI } from '@/store/ui'
import { gsap } from '@/lib/scroll'
import { useIsMobile, useReducedMotion } from '@/hooks/use-media'
import { Typewriter } from './Typewriter'
import { LeaderLine } from './LeaderLine'
import { pad } from './Frame'

type Side = 'left' | 'right' | 'bottom'

const SHOWN = 'inset(0% 0% 0% 0%)'
const HIDDEN_IN: Record<Side, string> = {
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  bottom: 'inset(100% 0% 0% 0%)',
}
const HIDDEN_OUT: Record<Side, string> = {
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
  bottom: 'inset(0% 0% 100% 0%)',
}

function PanelBody({ part, locked, nameRef }: { part: Part; locked: boolean; nameRef: React.RefObject<HTMLSpanElement | null> }) {
  const index = PART_INDEX[part.id] + 1
  return (
    <>
      <span
        aria-hidden
        className="text-stroke-signal pointer-events-none absolute -right-2 -top-6 select-none font-display text-[clamp(7rem,14vw,13rem)] leading-none"
      >
        {pad(index)}
      </span>

      <div className="relative flex flex-col gap-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider">
          <span className="text-bone/70">
            [{pad(index)}/{pad(PARTS.length)}] SYS // {part.system}
          </span>
          <span className={locked ? 'bg-signal px-1.5 py-0.5 text-ink' : 'border border-bone/30 px-1.5 py-0.5 text-bone/70'}>
            {locked ? 'LOCKED' : 'SCAN'}
          </span>
        </div>

        <h2 className="overflow-hidden font-display text-[clamp(2.5rem,4.6vw,5.25rem)] uppercase leading-[0.86]">
          <span ref={nameRef} className="block">
            {part.name}
          </span>
        </h2>

        <p className="max-w-[34ch] text-pretty font-sans text-sm leading-snug text-bone/85 md:text-[15px]">{part.pitch}</p>

        <dl className="flex flex-col gap-2 border-t border-bone/15 pt-4">
          {part.specs.map((s, i) => (
            <div key={s.label} className="flex items-baseline gap-2 font-mono text-[11px] uppercase">
              <dt className="shrink-0 text-bone/55">{s.label}</dt>
              <span aria-hidden className="min-w-4 flex-1 -translate-y-[3px] border-b border-dotted border-bone/30" />
              <dd className={`shrink-0 ${s.todo ? 'text-signal' : 'text-bone'}`}>
                <Typewriter text={s.value} delay={380 + i * 110} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="bg-signal p-3 text-ink">
          <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Why it matters</p>
          <p className="font-sans text-sm font-medium leading-snug">{part.why}</p>
        </div>

        {locked && (
          <p className="font-mono text-[10px] uppercase text-bone/50">Click part again or empty space to release</p>
        )}
      </div>
    </>
  )
}

export function InfoPanel() {
  const stage = useScene((s) => s.stage)
  const selected = useScene((s) => s.selected)
  const loaded = useUI((s) => s.loaded)
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()

  const targetId: PartId | null = !loaded ? null : (selected ?? (stage >= 0 && stage < PARTS.length ? PARTS[stage].id : null))
  const [shownId, setShownId] = useState<PartId | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const revealedRef = useRef(false)
  const wipingOut = useRef(false)
  const drag = useRef<{ y: number; id: number } | null>(null)

  const part = shownId ? PART_BY_ID[shownId] : null
  const side: Side = isMobile ? 'bottom' : (part?.side ?? 'left')

  useEffect(() => {
    const el = wrapRef.current
    if (targetId === shownId) {
      if (wipingOut.current && el) {
        wipingOut.current = false
        gsap.to(el, { clipPath: SHOWN, duration: 0.3, ease: 'power3.inOut', overwrite: true, onComplete: () => void (revealedRef.current = true) })
      }
      return
    }
    if (!shownId || !el || reduced) {
      setShownId(targetId)
      return
    }
    revealedRef.current = false
    wipingOut.current = true
    const tween = gsap.to(el, {
      clipPath: HIDDEN_OUT[side],
      duration: 0.36,
      ease: 'power3.inOut',
      overwrite: true,
      onComplete: () => {
        wipingOut.current = false
        setShownId(targetId)
      },
    })
    return () => {
      tween.kill()
    }
  }, [targetId, shownId, side, reduced])

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!shownId || !el) return
    setCollapsed(false)
    if (reduced) {
      gsap.set(el, { clipPath: SHOWN })
      revealedRef.current = true
      return
    }
    revealedRef.current = false
    const tl = gsap.timeline({ onComplete: () => void (revealedRef.current = true) })
    tl.fromTo(el, { clipPath: HIDDEN_IN[side] }, { clipPath: SHOWN, duration: 0.6, ease: 'power3.inOut' })
    tl.fromTo(nameRef.current, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'power3.inOut' }, '-=0.32')
    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownId])

  const onHandleDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { y: e.clientY, id: e.pointerId }
  }
  const onHandleUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dy = e.clientY - d.y
    if (dy > 30) setCollapsed(true)
    else if (dy < -30) setCollapsed(false)
    else setCollapsed((c) => !c)
  }

  const position =
    side === 'bottom'
      ? 'inset-x-0 bottom-[var(--hud-h)]'
      : side === 'left'
        ? 'left-[var(--gutter)] top-[calc(50%+var(--bar-h)/2-var(--hud-h)/2)] -translate-y-1/2'
        : 'right-[calc(var(--gutter)+2.25rem)] top-[calc(50%+var(--bar-h)/2-var(--hud-h)/2)] -translate-y-1/2'

  return (
    <>
      {part && (
        <aside
          aria-label={`${part.name} details`}
          aria-live="polite"
          className={`pointer-events-none fixed z-20 ${position} ${side === 'bottom' ? '' : 'w-[clamp(300px,31vw,460px)]'}`}
        >
          <div
            ref={wrapRef}
            className={`pointer-events-auto relative overflow-hidden border border-signal bg-ink transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] ${
              side === 'bottom' ? 'border-x-0 border-b-0' : 'max-h-[calc(100svh-var(--bar-h)-var(--hud-h)-2.5rem)]'
            }`}
            style={{
              clipPath: HIDDEN_IN[side],
              transform: side === 'bottom' && collapsed ? 'translateY(calc(100% - 84px))' : undefined,
            }}
          >
            {side === 'bottom' && (
              <button
                type="button"
                aria-label={collapsed ? 'Expand details' : 'Collapse details'}
                aria-expanded={!collapsed}
                onPointerDown={onHandleDown}
                onPointerUp={onHandleUp}
                onPointerCancel={() => (drag.current = null)}
                className="relative z-10 flex h-6 w-full touch-none items-center justify-center bg-ink"
              >
                <span className="block h-1 w-12 bg-bone/60" />
              </button>
            )}
            <div
              data-lenis-prevent
              className={side === 'bottom' ? 'max-h-[calc(40svh-24px)] overflow-y-auto overscroll-contain' : 'h-full'}
            >
              <PanelBody key={part.id} part={part} locked={selected === part.id} nameRef={nameRef} />
            </div>
          </div>
        </aside>
      )}
      <LeaderLine panelRef={wrapRef} revealedRef={revealedRef} partId={shownId} side={side} />
    </>
  )
}
