'use client'

import { useEffect, useRef, type RefObject } from 'react'
import type { PartId } from '@/data/parts'
import { live } from '@/store/scroll'

type Props = {
  panelRef: RefObject<HTMLDivElement | null>
  revealedRef: RefObject<boolean>
  partId: PartId | null
  side: 'left' | 'right' | 'bottom'
}

/** 1px red elbow line from the info panel to the part's projected screen position. */
export function LeaderLine({ panelRef, revealedRef, partId, side }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const lineRef = useRef<SVGPolylineElement>(null)
  const nodeRef = useRef<SVGRectElement>(null)
  const startRef = useRef<SVGRectElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const svg = svgRef.current
      const panel = panelRef.current
      const sp = partId ? live.screen[partId] : undefined
      if (!svg) return
      if (!panel || !sp || !sp.visible || !revealedRef.current) {
        svg.style.visibility = 'hidden'
        return
      }
      const rect = panel.getBoundingClientRect()
      let ax: number, ay: number, ex: number, ey: number
      if (side === 'left') {
        ax = rect.right
        ay = rect.top + 56
        ex = ax + 36
        ey = ay
      } else if (side === 'right') {
        ax = rect.left
        ay = rect.top + 56
        ex = ax - 36
        ey = ay
      } else {
        ax = rect.left + 40
        ay = rect.top
        ex = ax
        ey = ay - 28
      }
      svg.style.visibility = 'visible'
      lineRef.current?.setAttribute('points', `${ax},${ay} ${ex},${ey} ${sp.x},${sp.y}`)
      nodeRef.current?.setAttribute('x', String(sp.x - 4))
      nodeRef.current?.setAttribute('y', String(sp.y - 4))
      startRef.current?.setAttribute('x', String(ax - 2.5))
      startRef.current?.setAttribute('y', String(ay - 2.5))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [panelRef, revealedRef, partId, side])

  return (
    <svg ref={svgRef} aria-hidden className="pointer-events-none fixed inset-0 z-[19] h-full w-full" style={{ visibility: 'hidden' }}>
      <polyline ref={lineRef} fill="none" stroke="#e10600" strokeWidth={1} shapeRendering="crispEdges" />
      <rect ref={startRef} width={5} height={5} fill="#e10600" />
      <rect ref={nodeRef} width={8} height={8} fill="#0a0a0a" stroke="#e10600" strokeWidth={1.5} />
    </svg>
  )
}
