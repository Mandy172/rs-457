'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/use-media'

export function Typewriter({ text, delay = 0, speed = 26 }: { text: string; delay?: number; speed?: number }) {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (reduced) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    let interval = 0
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i++
        setCount(i)
        if (i >= text.length) window.clearInterval(interval)
      }, speed)
    }, delay)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [text, delay, speed, reduced])

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, count)}
        {count < text.length && <span className="inline-block w-[0.6em] bg-bone">&nbsp;</span>}
      </span>
    </>
  )
}
