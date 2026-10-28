'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, setLenis } from '@/lib/scroll'
import { useUI } from '@/store/ui'
import { useReducedMotion } from '@/hooks/use-media'

export function SmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (reduced) {
      const apply = (loaded: boolean) => (root.style.overflow = loaded ? '' : 'hidden')
      apply(useUI.getState().loaded)
      const unsub = useUI.subscribe((s) => apply(s.loaded))
      return () => {
        unsub()
        root.style.overflow = ''
      }
    }

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const apply = (loaded: boolean) => (loaded ? lenis.start() : lenis.stop())
    apply(useUI.getState().loaded)
    const unsub = useUI.subscribe((s) => apply(s.loaded))

    return () => {
      unsub()
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])

  return null
}
