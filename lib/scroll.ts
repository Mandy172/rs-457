import type Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

let lenis: Lenis | null = null
export const setLenis = (l: Lenis | null) => {
  lenis = l
}

export function scrollToProgress(p: number, immediate = false) {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const y = Math.max(0, Math.min(max, p * max))
  if (lenis) {
    lenis.scrollTo(y, {
      immediate,
      duration: 1.8,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    })
  } else {
    window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' })
  }
}
